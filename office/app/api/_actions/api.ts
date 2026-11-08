"use server";

import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { Types } from "mongoose";
import { revalidatePath } from "next/cache";

interface SaveUserInput {
  sub: string;
  key: string;
}

export async function login(input: SaveUserInput) {
  try {
    await connectDB();

    const user = await User.create(input);

    return {
      success: true,
      message: "Success",
      data: JSON.parse(JSON.stringify(user)),
    };
  } catch (error) {
    console.error("Login error:", error);

    return {
      success: false,
      message: "Failed to login",
    };
  }
}

export async function isLogged(sub: string) {
  try {
    if (!sub) {
      return { success: false, message: "Invalid sub" };
    }

    await connectDB();

    const user = await User.findOne({ sub }).lean();

    if (!user) {
      return { success: false, message: "User not found" };
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(user)),
    };
  } catch (error) {
    console.error("Get user error:", error);

    return { success: false, message: "Failed to find user" };
  }
}


// "use server";

// import connectDB from "@/lib/mongodb";
// import Visit from "@/models/Visit";
// import { Types } from "mongoose";
// import { revalidatePath } from "next/cache";

// // Types
// interface SaveVisitInput {
//   page: string;
//   userAgent?: string;
//   referrer?: string;
//   ipAddress?: string;
//   location?: {
//     country?: string;
//     countryCode?: string;
//     region?: string;
//     city?: string;
//     latitude?: number;
//     longitude?: number;
//     timezone?: string;
//     isp?: string;
//   };
// }

// interface VisitFilters {
//   page?: string;
//   ipAddress?: string;
//   country?: string;
//   city?: string;
// }

// interface PaginationOptions {
//   page?: number;
//   limit?: number;
// }

// // 1. Save a visit
// export async function saveVisit(input: SaveVisitInput) {
//   try {
//     await connectDB();

//     const visit = await Visit.create(input);

//     return {
//       success: true,
//       message: "Visit saved successfully",
//       data: JSON.parse(JSON.stringify(visit)),
//     };
//   } catch (error) {
//     console.error("Save visit error:", error);

//     return {
//       success: false,
//       message: "Failed to save visit",
//     };
//   }
// }

// // 2. Fetch all visits with pagination
// export async function getVisits({
//   page = 1,
//   limit = 20,
// }: PaginationOptions = {}) {
//   try {
//     await connectDB();

//     const safePage = Math.max(1, page);
//     const safeLimit = Math.min(100, Math.max(1, limit));

//     const [visits, total] = await Promise.all([
//       Visit.find()
//         .sort({ createdAt: -1 })
//         .skip((safePage - 1) * safeLimit)
//         .limit(safeLimit)
//         .lean(),

//       Visit.countDocuments(),
//     ]);

//     return {
//       success: true,
//       data: JSON.parse(JSON.stringify(visits)),
//       pagination: {
//         total,
//         page: safePage,
//         limit: safeLimit,
//         totalPages: Math.ceil(total / safeLimit),
//       },
//     };
//   } catch (error) {
//     console.error("Fetch visits error:", error);

//     return {
//       success: false,
//       message: "Failed to fetch visits",
//       data: [],
//     };
//   }
// }

// // 3. Look up visit by ID
// export async function getVisitById(id: string) {
//   try {
//     if (!Types.ObjectId.isValid(id)) {
//       return { success: false, message: "Invalid visit ID" };
//     }

//     await connectDB();

//     const visit = await Visit.findById(id).lean();

//     if (!visit) {
//       return { success: false, message: "Visit not found" };
//     }

//     return {
//       success: true,
//       data: JSON.parse(JSON.stringify(visit)),
//     };
//   } catch (error) {
//     console.error("Get visit error:", error);

//     return { success: false, message: "Failed to fetch visit" };
//   }
// }

// // 4. Search visits
// export async function searchVisits(filters: VisitFilters) {
//   try {
//     await connectDB();

//     const query: Record<string, unknown> = {};

//     if (filters.page) {
//       query.page = filters.page;
//     }

//     if (filters.ipAddress) {
//       query.ipAddress = filters.ipAddress;
//     }

//     if (filters.country) {
//       query["location.country"] = {
//         $regex: filters.country,
//         $options: "i",
//       };
//     }

//     if (filters.city) {
//       query["location.city"] = {
//         $regex: filters.city,
//         $options: "i",
//       };
//     }

//     const visits = await Visit.find(query)
//       .sort({ createdAt: -1 })
//       .limit(100)
//       .lean();

//     return {
//       success: true,
//       data: JSON.parse(JSON.stringify(visits)),
//     };
//   } catch (error) {
//     console.error("Search visits error:", error);

//     return {
//       success: false,
//       message: "Search failed",
//       data: [],
//     };
//   }
// }

// // 5. Get visit statistics
// export async function getVisitStats() {
//   try {
//     await connectDB();

//     const [total, today, countries, pages] = await Promise.all([
//       Visit.countDocuments(),

//       Visit.countDocuments({
//         createdAt: {
//           $gte: new Date(new Date().setHours(0, 0, 0, 0)),
//         },
//       }),

//       Visit.distinct("location.country"),

//       Visit.aggregate([
//         {
//           $group: {
//             _id: "$page",
//             visits: { $sum: 1 },
//           },
//         },
//         { $sort: { visits: -1 } },
//         { $limit: 10 },
//       ]),
//     ]);

//     return {
//       success: true,
//       data: {
//         totalVisits: total,
//         todayVisits: today,
//         totalCountries: countries.filter(Boolean).length,
//         topPages: pages.map((item) => ({
//           page: item._id,
//           visits: item.visits,
//         })),
//       },
//     };
//   } catch (error) {
//     console.error("Visit stats error:", error);

//     return {
//       success: false,
//       message: "Failed to fetch statistics",
//     };
//   }
// }

// // 6. Delete a visit
// export async function deleteVisit(id: string) {
//   try {
//     if (!Types.ObjectId.isValid(id)) {
//       return { success: false, message: "Invalid visit ID" };
//     }

//     await connectDB();

//     const visit = await Visit.findByIdAndDelete(id);

//     if (!visit) {
//       return { success: false, message: "Visit not found" };
//     }

//     revalidatePath("/admin/visits");

//     return {
//       success: true,
//       message: "Visit deleted successfully",
//     };
//   } catch (error) {
//     console.error("Delete visit error:", error);

//     return {
//       success: false,
//       message: "Failed to delete visit",
//     };
//   }
// }
