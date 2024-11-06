import commentClass from "../classes/comment.class"
import postClass from "../classes/post.class"

export const createPost = postClass.createPost
export const getPosts = postClass.getPosts
export const getPaginatedPosts = postClass.getPaginatedPosts
export const getUserPosts = postClass.getUserPosts
export const getPost = postClass.getPost
export const deletePost = postClass.deletePost
export const upvotePost = postClass.upvotePost
export const downvotePost = postClass.downvotePost
export const getComments = commentClass.getComments
export const addComment = commentClass.addcomment
export const upvoteComment = commentClass.upvoteComment
export const downvoteComment = commentClass.downvoteComment
export const deleteComment = commentClass.deleteComment
