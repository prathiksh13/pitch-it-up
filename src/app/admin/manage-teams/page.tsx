import dynamic from "next/dynamic";

const ManageTeamsClient = dynamic(() => import("./ManageTeamsClient"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  ),
});

export default function Page() {
  return <ManageTeamsClient />;
}
