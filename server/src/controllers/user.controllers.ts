import authClass from "../classes/auth.class"
import userClass from "../classes/user.class"

export const registerUser = authClass.registerUser
export const loginUser = authClass.loginUser
export const logoutUser = authClass.logoutUser
export const userProfile = userClass.userProfile
export const searchUser = userClass.searchUser
export const updateBio = userClass.updateBio
export const get10RandomUsers = userClass.get10RandomUsers
export const uploadProfileImage = userClass.uploadProfileImage
export const uploadCoverImage = userClass.uploadCoverImage
