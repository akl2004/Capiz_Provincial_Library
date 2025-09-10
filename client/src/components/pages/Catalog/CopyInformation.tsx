import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import AxiosInstance from "../../../AxiosInstance";
import LoadingSpinner from "../../LoadingSpinner";

interface BookCopy {
  id: number;
  date_added: string;
  material_type: string;
  source: string;
  source_person: string;
  cataloging_note: string;
}

interface Book {
  id: number;
  title: string;
  call_number: string;
  copies: BookCopy[];
}

const CopyInformation: React.FC = () => {
  const { id, copyId } = useParams<{ id: string; copyId: string }>();
  const [copy, setCopy] = useState<BookCopy | null>(null);
  const [callNumber, setCallNumber] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookAndCopy = async () => {
      try {
        const response = await AxiosInstance.get(`/books/${id}`);
        const book: Book = response.data;

        setCallNumber(book.call_number);

        // find the copy inside book.copies
        const foundCopy = book.copies.find((c) => c.id === Number(copyId));
        setCopy(foundCopy || null);
      } catch (error) {
        console.error("Error fetching book or copy:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookAndCopy();
  }, [id, copyId]);

  if (loading)
    return (
      <div className="center-page">
        <LoadingSpinner message="Loading copy details..." />
      </div>
    );

  if (!copy)
    return (
      <div className="center-page">
        <p className="text-gray-600 text-lg">Copy not found</p>
      </div>
    );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link to={`/cataloging/${id}`} className="text-blue-500 underline">
        ← Back to Book Details
      </Link>

      <div className="copies-info mt-4">
        <h1 className="text-xl font-semibold mb-4">Accession Record</h1>

        <table className="w-full">
          <tbody>
            <tr>
              <th className="text-left pr-4 font-semibold">Accession No.</th>
              <td className="pl-4 border-l">{callNumber || "N/A"}</td>
            </tr>
            <tr>
              <th className="text-left pr-4 font-semibold">Date Acquired</th>
              <td className="pl-4 border-l">
                {copy.date_added ? copy.date_added.split("T")[0] : "N/A"}
              </td>
            </tr>
            <tr>
              <th className="text-left pr-4 font-semibold">Material Type</th>
              <td className="pl-4 border-l">{copy.material_type || "N/A"}</td>
            </tr>
            <tr>
              <th className="text-left pr-4 font-semibold">
                Source of Acquisition
              </th>
              <td className="pl-4 border-l">{copy.source || "N/A"}</td>
            </tr>
            <tr>
              <th className="text-left pr-4 font-semibold">Funding Source</th>
              <td className="pl-4 border-l">{copy.source_person || "N/A"}</td>
            </tr>
            <tr>
              <th className="text-left pr-4 font-semibold">Catalog Note</th>
              <td className="pl-4 border-l">{copy.cataloging_note || "N/A"}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CopyInformation;
