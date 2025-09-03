import React, { useState, useEffect } from "react";
import { db } from "../../services/firebase";
import { collection, getDocs } from "firebase/firestore";

const Produtos = () => {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsRef = collection(db, "produtos");
        const snapshot = await getDocs(productsRef);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(data);
        setFiltered(data);
      } catch (err) {
        console.error("Erro ao buscar produtos:", err);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const results = products.filter((p) =>
      p.nome?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(results);
  }, [search, products]);

  return (
    <div className="p-6">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar produto..."
        className="border rounded-lg p-2 w-full mb-6"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filtered.map((prod) => (
          <div
            key={prod.id}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition"
          >
            <img
              src={prod.imagem || "https://via.placeholder.com/300"}
              alt={prod.nome}
              className="w-full h-48 object-cover"
            />

            <div className="p-4 flex flex-col gap-2">
              <h2 className="text-lg font-semibold">{prod.nome}</h2>
              <p className="text-gray-600">Preço: R$ {prod.preco}</p>
              <p className="text-gray-500">Estoque: {prod.quantidade}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Produtos;
