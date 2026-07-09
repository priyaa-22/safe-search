import React from "react";
import SearchPage from "../../components/SearchPage";

export default function SearchOperations({ showToast }) {
  return (
    <SearchPage
      role="internal"
      showToast={showToast}
    />
  );
}
