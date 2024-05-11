import "./web-polyfill";

import { Toast, getPreferenceValues, showToast } from "@raycast/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { UTApi, UTFile } from "uploadthing/server";
import { UploadedFileData } from "uploadthing/types";
import { readFilesFromClipboard } from "./utils";

export const useUpload = () => {
  const toast = useRef<Toast | null>(null);
  const { apiKey } = getPreferenceValues();
  const utapi = new UTApi({ apiKey });

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileData[]>([]);

  const mutation = useMutation({
    mutationFn: async (files: UTFile[]) => {
      return await utapi.uploadFiles(files);
    },
    onMutate: async () => {
      toast.current = await showToast({
        title: "Uploading files",
        message: "Uploading files to UploadThing",
        style: Toast.Style.Animated,
      });
    },
    onSuccess: (data) => {
      console.log(data);
      toast.current!.style = Toast.Style.Success;
      toast.current!.title = "Files uploaded";

      setUploadedFiles(
        data.filter((file) => !!file.data).map((file) => file.data!),
      );
    },
    onError: (err) => {
      console.error(err);
      toast.current!.style = Toast.Style.Failure;
      toast.current!.title = "Failed to upload files";
      toast.current!.message = err.message;
    },
  });

  return {
    upload: mutation.mutate,
    uploading: mutation.isPending,
    uploadedFiles,
  };
};

export const useClipboardFiles = () => {
  const query = useQuery({
    queryKey: ["clipboard"],
    queryFn: readFilesFromClipboard,
  });

  return { files: query.data, readingClipboard: query.isPending };
};
