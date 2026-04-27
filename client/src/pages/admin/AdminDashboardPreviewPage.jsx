import AdminDashboardOverview from "../../components/admin-dashboard/AdminDashboardOverview";

const previewData = {
  productTotal: 124,
  users: [
    { _id: "u1", name: "Mia Collins", email: "mia@northlane.co", role: "customer" },
    { _id: "u2", name: "Jonas Petrauskas", email: "jonas@balticretail.lt", role: "customer" },
    { _id: "u3", name: "Elena Ortiz", email: "elena@modestudio.io", role: "customer" },
    { _id: "u4", name: "Admin User", email: "admin@manoshop.lt", role: "admin" },
    { _id: "u5", name: "Noah Kim", email: "noah@brightcart.com", role: "customer" },
  ],
  products: [
    { _id: "p1", name: "Aether Hoodie", category: "Apparel", stock: 18 },
    { _id: "p2", name: "Lumen Bottle", category: "Lifestyle", stock: 4 },
    { _id: "p3", name: "North Tote", category: "Accessories", stock: 11 },
    { _id: "p4", name: "Studio Journal", category: "Stationery", stock: 3 },
    { _id: "p5", name: "Nimbus Tee", category: "Apparel", stock: 26 },
  ],
  orders: [
    {
      _id: "ord1001",
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      totalPrice: 1240,
      status: "delivered",
      items: [{}, {}, {}],
      user: { name: "Mia Collins", email: "mia@northlane.co" },
    },
    {
      _id: "ord1002",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      totalPrice: 860,
      status: "pending",
      items: [{}, {}],
      user: { name: "Jonas Petrauskas", email: "jonas@balticretail.lt" },
    },
    {
      _id: "ord1003",
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      totalPrice: 1720,
      status: "shipped",
      items: [{}, {}, {}, {}],
      user: { name: "Elena Ortiz", email: "elena@modestudio.io" },
    },
    {
      _id: "ord1004",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      totalPrice: 980,
      status: "delivered",
      items: [{}, {}],
      user: { name: "Noah Kim", email: "noah@brightcart.com" },
    },
    {
      _id: "ord1005",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      totalPrice: 2140,
      status: "pending",
      items: [{}, {}, {}],
      user: { name: "Ava Thompson", email: "ava@signalhaus.com" },
    },
    {
      _id: "ord1006",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      totalPrice: 1560,
      status: "shipped",
      items: [{}, {}],
      user: { name: "Luca Weber", email: "luca@ateliercommerce.de" },
    },
    {
      _id: "ord1007",
      createdAt: new Date().toISOString(),
      totalPrice: 2740,
      status: "pending",
      items: [{}, {}, {}, {}],
      user: { name: "Sofia Rossi", email: "sofia@dailylane.it" },
    },
  ],
};

const AdminDashboardPreviewPage = () => (
  <AdminDashboardOverview dashboardData={previewData} previewMode />
);

export default AdminDashboardPreviewPage;
