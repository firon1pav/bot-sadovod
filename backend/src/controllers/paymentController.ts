
// Payment controller removed as monetization is disabled.
export const paymentController = {
    createPayment: (req: any, res: any) => res.status(404).json({ error: "Payments disabled" }),
    webhook: (req: any, res: any) => res.status(200).send("OK")
};
