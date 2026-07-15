import { getAllOrders } from '@/app/actions/orders'
import { AdminOrdersClient } from '../../orders/admin-orders-client'
import { AdminPageHeader } from '../../admin-ui'

export default async function AdminOrdersPage() {
  const orders = await getAllOrders()

  return (
    <div>
      <AdminPageHeader
        eyebrow="VENTES"
        title="Commandes"
        description="Consultez, modifiez le statut, editez les informations client ou supprimez des commandes."
      />
      <AdminOrdersClient initialOrders={orders} />
    </div>
  )
}
