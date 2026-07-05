"use client";

import { useEffect } from "react";
import { syncDriveFiles } from "@/actions/drive-sync";

export default function DriveVerifier() {
  useEffect(() => {
    // Run the sync check in the background when the dashboard mounts
    syncDriveFiles()
      .then((res) => {
        if (res.error) {
          console.error("Drive sync verification failed:", res.error);
        } else {
          console.log(`Drive sync complete: ${res.verified} verified, ${res.missing} missing documents updated.`);
        }
      })
      .catch((err) => {
        console.error("Failed to run drive sync check:", err);
      });
  }, []);

  // Renders nothing, just runs the effect
  return null;
}
