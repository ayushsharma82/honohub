"use client";
import { usePathname } from "next/navigation";
import { Header } from "../../Components";
import { CollectionDocumentsTable } from "./Datatable";

export function ListPage() {
  const pathname = usePathname();
  const slug = pathname.split("/")[2];

  return (
    <>
      <Header slug={slug} basepath="/sample" />
      <div className="space-y-5">
        <h1 className="text-3xl font-bold capitalize">{slug}</h1>
        <CollectionDocumentsTable />
      </div>
    </>
  );
}
