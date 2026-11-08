
import dotenv from "dotenv";
dotenv.config();
import connectDB from "../lib/mongodb";
import { sendEmail } from "../lib/mailer";
import mongoose from "mongoose";
import User from "@/models/User";


const BATCH_SIZE = Number(process.env.BATCH_SIZE || 50);

export async function processUsers() {
  const batchId = new mongoose.Types.ObjectId().toString();

  try {
    await connectDB();

    // Atomically claim unseen, unclaimed records.
    const users = await User.find({
      seen: false,
      processing: false,
    })
      .sort({ createdAt: 1 })
      .limit(BATCH_SIZE)
      .lean();

    if (!users.length) return;

    const ids = users.map((user) => user._id);

    const claimed = await User.updateMany(
      {
        _id: { $in: ids },
        seen: false,
        processing: false,
      },
      {
        $set: {
          processing: true,
          batchId,
        },
      }
    );

    if (!claimed.modifiedCount) return;

    const claimedVisits = await User.find({
      _id: { $in: ids },
      batchId,
      processing: true,
    }).lean();

    if (!claimedVisits.length) return;

    const html = `
      <h2>New Visit Notifications</h2>
      <p>${claimedVisits.length} new records were received.</p>
      <table border="1" cellpadding="8" cellspacing="0">
        <tr>
          <th>Page</th>
          <th>IP Address</th>
          <th>Date</th>
        </tr>
        ${claimedVisits
          .map(
            (visit) => `
              <tr>
                <td>${escapeHtml(visit.page)}</td>
                <td>${escapeHtml(visit.ipAddress || "Unknown")}</td>
                <td>${visit.createdAt?.toISOString() || ""}</td>
              </tr>
            `
          )
          .join("")}
      </table>
    `;

    await sendEmail(
      `${claimedVisits.length} New Visit Records`,
      html
    );

    // Mark records as seen only after successful email delivery.
    await User.updateMany(
      {
        _id: { $in: claimedVisits.map((visit) => visit._id) },
        batchId,
      },
      {
        $set: { seen: true, processing: false },
        $unset: { batchId: 1 },
      }
    );

    console.log(`Successfully processed ${claimedVisits.length} records.`);
  } catch (error) {
    console.error("Worker error:", error);

    // Release claimed records so they can be retried.
    await User.updateMany(
      { batchId },
      {
        $set: { processing: false },
        $unset: { batchId: 1 },
      }
    );
  }
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[char];
  });
}

async function startWorker() {
  await connectDB();

  console.log("Visit notification worker started.");

  await processUsers();

  const interval = Number(process.env.JOB_INTERVAL || 60000);

  setInterval(processUsers, interval);
}

startWorker().catch(console.error);
