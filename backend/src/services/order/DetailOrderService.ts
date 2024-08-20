import prismaClient from "../../prisma";

interface DetaiilRequest {
    order_id: string
}

class DetailOrderService {
    async execute({ order_id }: DetaiilRequest) {
        const orders = await prismaClient.item.findMany({
            where: {
                order_id: order_id
            },
            include: {
                product: true,
                order:true
            }
        })

        return orders
    }
}

export { DetailOrderService }