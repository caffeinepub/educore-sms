import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";
import LibraryModule from "../librarian/LibraryModule";
import BulkImportModule from "./BulkImportModule";

export default function AdminLibraryModule() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Library Management</h2>

      <Tabs defaultValue="library">
        <TabsList data-ocid="admin.library.tabs">
          <TabsTrigger value="library" data-ocid="admin.library.module.tab">
            Library Module
          </TabsTrigger>
          <TabsTrigger
            value="bulk-import"
            data-ocid="admin.library.bulk_import.tab"
          >
            Bulk Import
          </TabsTrigger>
        </TabsList>

        {/* Full Library Module — all features available to admin */}
        <TabsContent value="library">
          <LibraryModule />
        </TabsContent>

        {/* Bulk Import — books only */}
        <TabsContent value="bulk-import">
          <BulkImportModule defaultTab="books" tabs={["books"]} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
