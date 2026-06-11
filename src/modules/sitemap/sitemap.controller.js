import prisma from "../../lib/prisma.js";




const STATIC_URLS = [
  { loc: "/", priority: "1.0", changefreq: "weekly" },
  { loc: "/creadores.html", priority: "0.8", changefreq: "monthly" },
  { loc: "/terminos.html", priority: "0.3", changefreq: "yearly" },
  { loc: "/privacidad.html", priority: "0.3", changefreq: "yearly" },
  { loc: "/cursos.html", priority: "0.9", changefreq: "daily" },
  { loc: "/login.html", priority: "0.5", changefreq: "monthly" },
  { loc: "/registro.html", priority: "0.5", changefreq: "monthly" },
];

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const generarSitemap = async (req, res) => {
  try {
    const cursos = await prisma.course.findMany({
      select: { id: true, updatedAt: true },
    });

    const baseUrl = process.env.FRONTEND_URL || "https://alala.cl";

    const urls = [
      ...STATIC_URLS.map((u) => ({
        loc: `${baseUrl}${u.loc}`,
        lastmod: new Date().toISOString().split("T")[0],
        changefreq: u.changefreq,
        priority: u.priority,
      })),
      ...cursos.map((c) => ({
        loc: `${baseUrl}/curso.html?id=${c.id}`,
        lastmod: c.updatedAt.toISOString().split("T")[0],
        changefreq: "weekly",
        priority: "0.7",
      })),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    <lastmod>${escapeXml(u.lastmod)}</lastmod>
    <changefreq>${escapeXml(u.changefreq)}</changefreq>
    <priority>${escapeXml(u.priority)}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

    res.setHeader("Content-Type", "application/xml");
    res.send(xml);
  } catch (err) {
    console.error("[sitemap] generarSitemap:", err.message);
    res.status(500).json({ error: "Error generando sitemap" });
  }
};
