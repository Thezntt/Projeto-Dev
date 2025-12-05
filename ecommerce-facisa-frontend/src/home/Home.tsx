import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  category: string;
}

interface Promotion {
  _id: string;
  product: Product;
  discountPercentage: number;
  startDate: string;
  endDate: string;
}

export default function Home() {
  const navigate = useNavigate();

  const [recommended, setRecommended] = useState<Product[]>([]);
  const [others, setOthers] = useState<Product[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/");
          return;
        }

        // buscar produtos e promoções em paralelo
        const [productsRes, promosRes] = await Promise.all([
          axios.get("http://localhost:3000/api/products", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:3000/api/promotions", { headers: { Authorization: `Bearer ${token}` } })
        ]);

        const productsData = productsRes.data;
        if (productsData.recommended || productsData.others) {
          setRecommended(productsData.recommended || []);
          setOthers(productsData.others || []);
        } else if (Array.isArray(productsData)) {
          setOthers(productsData);
        }

        const promosData = promosRes.data || [];
        setPromotions(promosData);

      } catch (error: any) {
        console.error("Erro ao buscar dados:", error);
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          alert("Sua sessão expirou. Faça login novamente.");
          localStorage.removeItem("token");
          navigate("/");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (loading) return <p>Carregando ofertas...</p>;

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const formatCurrency = (value: number) => `R$ ${value.toFixed(2)}`;

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <h1 style={{ margin: 0 }}>Bem-vindo ao Supermercado!</h1>
        <button onClick={handleLogout} style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #ccc", background: "white", cursor: "pointer" }}>
          Sair
        </button>
      </div>

      {promotions.length > 0 && (
        <div style={{ marginBottom: "30px", padding: "12px", borderRadius: 8, background: "#fff7e6" }}>
          <h2 style={{ marginTop: 0 }}>🔥 Promoções para você</h2>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            {promotions.map((promo) => {
              const product = promo.product;
              const discounted = +(product.price * (1 - promo.discountPercentage / 100)).toFixed(2);
              return (
                <div key={promo._id} className="card" style={{ border: "1px solid #f0c36d", padding: "10px", width: "220px", background: "#fff" }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0 }}>{product.name}</h3>
                    <span style={{ background: '#ffdd57', padding: '4px 8px', borderRadius: 6 }}>{promo.discountPercentage}%</span>
                  </div>
                  <p style={{ marginTop: 6 }}>{product.description}</p>
                  <p style={{ margin: 0 }}><small>De: <s>{formatCurrency(product.price)}</s></small></p>
                  <p style={{ marginTop: 4 }}><strong>Por: {formatCurrency(discounted)}</strong></p>
                  <button>Comprar</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {recommended.length > 0 && (
        <div style={{ marginBottom: "40px", backgroundColor: "#f0f8ff", padding: "10px", borderRadius: "8px" }}>
          <h2 style={{ color: "#007bff" }}>🌟 Ofertas Escolhidas para Você</h2>
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            {recommended.map((product) => (
              <div key={product._id} className="card" style={{ border: "1px solid #ddd", padding: "10px", width: "200px" }}>
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <p><strong>{formatCurrency(product.price)}</strong></p>
                <button>Comprar</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* OUTROS PRODUTOS */}
      <h2>Todos os Produtos</h2>
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {others.map((product) => (
          <div key={product._id} className="card" style={{ border: "1px solid #ddd", padding: "10px", width: "200px" }}>
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p><strong>{formatCurrency(product.price)}</strong></p>
            <button>Comprar</button>
          </div>
        ))}
      </div>
    </div>
  );
}