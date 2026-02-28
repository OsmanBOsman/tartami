// app/(protected)/admin/auctions/new/page.tsx
import AuctionForm from "../../components/AuctionForm";

export default function NewAuctionPage() {
  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold">Create Auction Event</h1>
      <AuctionForm mode="create" />
    </div>
  );
}
