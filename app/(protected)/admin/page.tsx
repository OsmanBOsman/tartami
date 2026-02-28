export default function AdminHome() {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold">Admin Dashboard</h1>
  
        <p className="text-muted-foreground">
          Welcome to the Tartami admin panel. Choose a section from the sidebar to begin.
        </p>
  
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-4 border rounded-lg bg-white">
            <h2 className="font-semibold text-lg">Auctions</h2>
            <p className="text-muted-foreground text-sm">Manage auction events.</p>
          </div>
  
          <div className="p-4 border rounded-lg bg-white">
            <h2 className="font-semibold text-lg">Items</h2>
            <p className="text-muted-foreground text-sm">Approve and manage items.</p>
          </div>
  
          <div className="p-4 border rounded-lg bg-white">
            <h2 className="font-semibold text-lg">Users</h2>
            <p className="text-muted-foreground text-sm">View and manage user accounts.</p>
          </div>
        </div>
      </div>
    );
  }
  