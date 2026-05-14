import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

function App() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(data);
      } catch (error) {
        console.error("Feil ved henting:", error);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div>
      <h1>Produkter</h1>
      {products.map((product) => (
        <div key={product.id}>
          <p>Navn: {product.name}</p>
          <p>Pris: {product.price}</p>
          <p>På lager: {product.inStock ? "Ja" : "Nei"}</p>
        </div>
      ))}
    </div>
  );
}

export default App;