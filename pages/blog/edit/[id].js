import React, { useEffect, useState } from "react";
import withAuth from "../../../protectedRoute/auth";
import { useDispatch, useSelector } from "react-redux";
import { supabase } from "../../../lib/supabaseClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addAllBlogsOfLoggedUser } from "../../../Redux/Features/blogFeature/blogSlice";
import Head from "next/head";
import Select from "react-select";
import { deleteTags } from "../../../service/api";
import { toast } from "react-toastify";
/** function for handling user tag selection process. it will return 
 two things first one if old tags are deleted then respective tag id and second new selected tag id
*/
function getMissingAndNewTagIDs(oldTags, selectedTags, deletionArray) {
  const selectedTagIDs = selectedTags.map((tag) => tag.value);
  const selectedTagIDsSet = new Set(selectedTagIDs);

  const missingTagIDs = oldTags.filter(
    (tagID) => !selectedTagIDsSet.has(tagID)
  );

  const oldTagsMap = {};
  for (let i = 0; i < oldTags.length; i++) {
    oldTagsMap[oldTags[i]] = i;
  }

  const reqbody = selectedTags.filter((tag) => !(tag.value in oldTagsMap));

  const btjTags = missingTagIDs.map(
    (tagID) => deletionArray[oldTagsMap[tagID]]
  );

  return { reqbody, btjTags };
}

function EditBlog() {
  const { editBlogPost, allTags, allCategories } = useSelector(
    (store) => store.blogReducer
  );
  // const { user } = useSelector((store) => store.userReducer);
  const user= JSON.parse(sessionStorage.getItem("user")) || {}
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const fileInputRef = React.useRef();
  const [uploadedImage, setUploadedImage] = useState(null);
  const [toggleUploadImageState, setToggeUploadState] = useState(false);
  const [blogInput, setBlogInput] = useState({
    title: "",
    body: "",
  });
  const [isUploading,setIsUploading] = useState("Upload");
  const [resetForm, setResetForm] = useState(false);
  const [selectedTags, setSelectedTags] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [errorMessage, setErrorMessage] = useState({});
  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileInputChange = async (event) => {
    try {
      const avatarFile = event.target.files[0];
      const filename = `${Date.now()}_${avatarFile.name}`; // Use a unique filename
      const imagePath = uploadedImage.substring(
        uploadedImage.lastIndexOf("/") + 1
      );
      //! delete the current image from bucket
      const fileDeleteResult = await supabase.storage
        .from("blog-medias")
        .remove([imagePath]);
      //?if deleted then upload new image and update the blog also
      if (fileDeleteResult.data?.length > 0) {
        setIsUploading("Uploading image...")
        //** upload the new image to the bucket and get public url
        const { data, error } = await supabase.storage
          .from("blog-medias")
          .upload(filename, avatarFile);
        if (error) {
          console.error("Error uploading file:", error);
          return;
        }
        

        if (data.path) {
         
          const publicurl = await supabase.storage
            .from("blog-medias")
            .getPublicUrl(`${data.path}`, 60);
          const createPost = await supabase
            .from("blog")
            .update({ image: publicurl?.data?.publicUrl })
            .match({ id: user.id, blog_id: editBlogPost.blog_id });
          queryClient.invalidateQueries("blogPost");
          queryClient.invalidateQueries("blogDetail");
          setUploadedImage(publicurl?.data?.publicUrl);
          setIsUploading("Image uploaded🎉")
          // console.log("post updated successfully", createPost);
        }
      }
      // console.log("file delete result: ", fileDeleteResult);
    } catch (error) {
      console.log("error", error);
    }
    // Do something with the selected file
  };
  const blogInputHanlder = (e) => {
    let { name, value } = e.target;
    value = value.trimStart();
    if (/^[A-Za-z]/.test(value)) {
      value = value.charAt(0).toUpperCase() + value.slice(1);
    }
    setBlogInput({ ...blogInput, [name]: value });
  };
  // console.log('selected tags: ', selectedTags)
  const mutation = useMutation(
    async () => {
      try {
        //! getting latest tags selection from user
        const { reqbody, btjTags } = getMissingAndNewTagIDs(
          editBlogPost.tags_id,
          selectedTags,
          editBlogPost.btj_tags_id
        );
        //!deleting old tags
        if (btjTags.length > 0) {
          const deletedTags = await deleteTags(btjTags, user.id);
          // console.log("deleted tags: ", deletedTags)
        }
        //! creating new tags if selected
        if (reqbody.length > 0) {
          const updatedBody = reqbody.map((tag) => ({
            tag_id: tag.value,
            blog_id: editBlogPost.blog_id,
            user_id: user.id,
          }));
          const createTags = await supabase
            .from("blog_tags_junction")
            .insert(updatedBody);
          // console.log("created tags: ", createTags)
        }
        const updatedBlogResult = await supabase
          .from("blog")
          .update({ ...blogInput, category: selectedCategory.value })
          .match({ id: editBlogPost.id, blog_id: editBlogPost.blog_id });
        //  console.log('updated blog result', updatedBlogResult)
        const updatedBlogList = await supabase
          .from("blog_with_user_info8")
          .select()
          .eq("id", editBlogPost.id)
          .order("created_at", { ascending: false });
        dispatch(addAllBlogsOfLoggedUser(updatedBlogList.data));
      } catch (error) {
        console.log("error", error);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("blogPost");
        queryClient.invalidateQueries("blogDetail");
      },
    }
  );
  const updateBlogContentHandler = async (e) => {
    e.preventDefault();
    if (
      blogInput.title == "" ||
      blogInput.body == "" ||
      selectedTags.length == 0
    ) {
      return;
    }
    mutation.mutate();
  };

  useEffect(() => {
    setBlogInput({ title: editBlogPost.title, body: editBlogPost.body });
    setUploadedImage(editBlogPost.image);
  }, [toggleUploadImageState]);
  // console.log("selected category", selectedCategory);
  useEffect(() => {
    setBlogInput({
      title: editBlogPost.title,
      body: editBlogPost.body,
    });
    setSelectedCategory({
      value: editBlogPost.category_id,
      label: editBlogPost.category_name,
    });
    if (editBlogPost.tags_id) {
      const tagOptionFormat = editBlogPost.tags_id.map((tag, index) => ({
        value: tag,
        label: editBlogPost.tags[index],
      }));
      // console.log('tag option', tagOptionFormat);
      setSelectedTags(tagOptionFormat);
    }
  }, [resetForm]);
  return (
    <>
      <Head>
        <title>Edit blog</title>
      </Head>
      <div className="container mx-auto p-3 shadow border h-auto">
        <div className=" w-full  flex  flex-col sm:flex-col md:flex-row lg:flex-row items-center justify-between gap-5 p-2">
          {/* blog image section  */}
          <div className="flex-1   h-fit p-3">
            <div className="w-full grid items-center">
              <img
                src={`${uploadedImage}`}
                alt=""
                className="w-full h-96  rounded border "
              />
              <div>
                <label
                  className="block mt-1 mb-1 text-sm font-medium text-gray-900 dark:text-white"
                  htmlFor="file_input"
                >
                  Update Blog Image
                </label>
                <input
                  className="hidden"
                  ref={fileInputRef}
                  id="file_input"
                  type="file"
                  onChange={handleFileInputChange}
                />
                <button
                  type="submit"
                  onClick={handleButtonClick}
                  className=" bg-gradient-to-r from-green-400 to-blue-500 hover:from-pink-500 hover:to-yellow-500inline-block px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
                >
                  {isUploading}
                </button>
              </div>
            </div>
          </div>
          {/* blog text content */}
          <div className="flex-1 border h-full   p-3 ">
            <div className="w-72 md:w-full lg:w-full xl:w-full  h-full">
              <form>
                <div className="mb-3">
                  <label
                    htmlFor="email"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Blog Title
                  </label>
                  <input
                    type="text"
                    id="email"
                    name="title"
                    value={blogInput.title}
                    onChange={blogInputHanlder}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="name@flowbite.com"
                    required
                  />
                </div>
                <div className="mb-3">
                  <div>
                    <label
                      htmlFor="message"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Blog Content
                    </label>
                    <textarea
                      id="message"
                      name="body"
                      value={blogInput.body}
                      onChange={blogInputHanlder}
                      rows={4}
                      className="block h-40 resize-none p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="start typing..."
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <div>
                    {errorMessage.category ? (
                      <label
                        htmlFor="message"
                        className="block mb-2 text-sm font-medium text-red-500 dark:text-white"
                      >
                        {errorMessage.category}
                      </label>
                    ) : (
                      <label
                        htmlFor="message"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Choose Category
                      </label>
                    )}
                    <Select
                      menuPlacement="top"
                      value={selectedCategory}
                      onChange={setSelectedCategory}
                      options={allCategories}
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <div>
                    {errorMessage.tag ? (
                      <label
                        htmlFor="message"
                        className="block mb-2 text-sm font-medium text-red-500 dark:text-white"
                      >
                        {errorMessage.tag}
                      </label>
                    ) : (
                      <label
                        htmlFor="message"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Choose Tags
                      </label>
                    )}
                    <Select
                      menuPlacement="top"
                      value={selectedTags}
                      onChange={setSelectedTags}
                      options={allTags}
                      isOptionDisabled={() => selectedTags.length == 5}
                      isMulti
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setResetForm(!resetForm);
                  }}
                  className="text-white mr-3 mb-3 bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm  px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  onClick={updateBlogContentHandler}
                  className="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm  px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  {mutation.status === "loading" && "Updating ..."}
                  {mutation.status === "idle" && "Update"}
                  {mutation.status === "success" && "Post Updated "}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
export default withAuth(EditBlog);
