export default function handler(req: any, res: any) {
  const { isFeatured, limit = 8 } = req.query;
  res.status(200).json({
    items: Array.from({ length: Number(limit) }, (_, i) => ({
      id: i + 1,
      title: `Product ${i + 1}`,
      featured: isFeatured === "true"
    }))
  });
}
