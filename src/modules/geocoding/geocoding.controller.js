export const geocode = async (req, res) => {
  try {
    const { direccion } = req.body;

    if (!direccion || typeof direccion !== "string") {
      return res.status(400).json({ error: "direccion es requerida" });
    }

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      direccion
    )}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "ALALA Chile (hola@alala.cl)",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim respondió con status ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(404).json({ error: "Dirección no encontrada" });
    }

    const first = data[0];
    res.json({
      lat: parseFloat(first.lat),
      lng: parseFloat(first.lon),
      display_name: first.display_name,
    });
  } catch (err) {
    console.error("[geocoding] geocode:", err.message);
    res.status(500).json({ error: "Error al geocodificar la dirección" });
  }
};
