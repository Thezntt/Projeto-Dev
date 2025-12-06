import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Admin.css";
import AdminHeader from "./AdminHeader";

export default function ProductForm() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const productData = { name, price: parseFloat(price), description, category };

    try {
      const response = await fetch("http://localhost:3000/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        setMessage("Produto cadastrado com sucesso!");
        setName("");
        setPrice("");
        setDescription("");
        setCategory("");
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || "Erro ao cadastrar produto.");
      }
    } catch (error) {
      console.error("Erro ao cadastrar produto:", error);
      setMessage("Erro ao conectar com o servidor.");
    }
  };

  return (
    <div className="admin-page">
      <AdminHeader title="Cadastrar Produto" />
      <div className="admin-section">
        {message && <p>{message}</p>}
        <form onSubmit={handleSubmit} className="admin-form">
          <input type="text" placeholder="Nome do Produto" value={name} onChange={(e) => setName(e.target.value)} required />
          <input type="number" placeholder="Preço" value={price} onChange={(e) => setPrice(e.target.value)} required />
          <textarea placeholder="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} required />
          <input type="text" placeholder="Categoria" value={category} onChange={(e) => setCategory(e.target.value)} required />
          <button type="submit">Cadastrar</button>
        </form>
        <button onClick={() => navigate("/home")} style={{ marginTop: 10 }}>Voltar</button>
      </div>
    </div>
  );
}