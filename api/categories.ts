export default function handler(req: any, res: any) {
  res.status(200).json([
    { id: 1, name: "Rings" },
    { id: 2, name: "Necklaces" }
  ]);
}
