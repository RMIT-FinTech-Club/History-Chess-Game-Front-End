// import React from "react";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { MoveHistoryRow } from "./MoveHistoryRow";
// import { MoveHistoryTableProps } from "../types";

// export const MoveHistoryTable: React.FC<MoveHistoryTableProps> = ({
//   moveHistoryPairs,
// }) => (
//   <div className="rounded shadow-md bg-[#3B3433] h-full w-full p-5 rounded-[0.625rem]">
//     <ScrollArea className="h-full w-full">
//       <table className="w-full text-white">
//         <thead className="sticky top-0 z-10 bg-[#3B3433]">
//           <tr className="grid grid-cols-4">
//             <th className="col-span-1 py-2 px-2 sm:px-5 text-center text-lg font-semibold">
//               Turn
//             </th>
//             <th className="col-span-1 py-2 px-2 sm:px-5 text-center text-lg font-semibold">
//               White
//             </th>
//             <th className="col-span-1 py-2 px-2 sm:px-5 text-center text-lg font-semibold">
//               Black
//             </th>
//             <th className="col-span-1 py-2 px-2 sm:px-5 text-center text-lg  font-semibold">
//               Time
//             </th>
//           </tr>
//         </thead>
//         <tbody>
//           {moveHistoryPairs.map((pair) => (
//             <MoveHistoryRow key={pair.turn} pair={pair} />
//           ))}
//         </tbody>
//       </table>
//     </ScrollArea>
//   </div>
// );