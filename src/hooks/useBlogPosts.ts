import { apiClient } from "@/src/api/client";
import { BlogPost } from "@/src/types/api";
import { useQuery } from "@tanstack/react-query";

export function useBlogPosts() {
  return useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/blog/posts");
        const payload = res.data?.data;
        if (Array.isArray(payload)) return payload as BlogPost[];
        return [];
      } catch {
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}
