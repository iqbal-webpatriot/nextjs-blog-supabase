import { supabase } from "../lib/supabaseClient";

export const getAllBlogPostFromSupabase = async (
  searchQuery,
  categoryName,
  limit
) => {
  let query = supabase
    .from("blog_with_user_info8")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });
  if (searchQuery && categoryName) {
    query = query
      .eq("category_id", categoryName)
      .ilike("title", `%${searchQuery}%`)
      .limit(limit);
    return query;
  }
  if (searchQuery) {
    query = query.ilike("title", `%${searchQuery}%`).limit(limit);
    return query;
  }

  if (categoryName) {
    query = query.eq("category_id", categoryName).limit(limit);
    return query;
  }

  return query.limit(limit);
};

export const getTotalBlogsCount = async (searchQuery, categoryName) => {
  let query = supabase
    .from("blog_with_user_info8")
    .select("*", { count: "exact" });
  if (searchQuery && categoryName) {
    query = query
      .eq("category_id", categoryName)
      .ilike("title", `%${searchQuery}%`);
    return query;
  }
  if (searchQuery) {
    query = query.ilike("title", `%${searchQuery}%`).limit(5);
    return query;
  }

  if (categoryName) {
    query = query.eq("category_id", categoryName);
    return query;
  }

  return query;
};
export const getSingleBlogPostFromSupabase = async (postId) => {
  return supabase.from("blog_with_user_info8").select("*").eq("blog_id", postId);
};
export const getLikedPostFromSupabase = async (reqbody) => {
  return supabase
    .from("user_likes")
    .select("blog_id,user_id,is_liked")
    .match(reqbody);
};

export const allBlogPostOfLoggedUser = async (userid) => {
  return await supabase
    .from("blog_with_user_info8")
    .select()
    .eq("id", userid)
    .order("created_at", { ascending: false });
};

export const searchAllBlogPostOfLoggedUser = async (userid, searchQuery) => {
  return await supabase
    .from("blog_with_user_info8")
    .select("*")
    .eq("id", userid)
    .ilike("title", `%${searchQuery}%`)
    .order("created_at", { ascending: false });
};
export const getAllTags = async () => {
  return supabase.from("blog_tags").select();
};
export const getAllCategories = async () => {
  return supabase.from("blog_category").select();
};
export const deleteTags = async (tags, user_id) => {
  return await supabase
    .from("blog_tags_junction")
    .delete()
    .in("bt_junction_id", tags)
    .eq("user_id", user_id);
};
