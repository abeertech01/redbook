import { useGetUserPostsQuery } from "@/app/api/post"
import {
  useUpdateBioMutation,
  useUploadCoverImageMutation,
  useUploadProfileImageMutation,
} from "@/app/api/user"
import { AppDispatch, RootState } from "@/app/store"
import { useAppShell } from "@/components/layout/AppShellContext"
import PostCard from "@/components/PostCard"
import UserAvatar from "@/components/UserAvatar"
import useLogout from "@/hooks/useLogout"
import { formatHumanReadTimestamp } from "@/lib/helper"
import { cn } from "@/lib/utils"
import { Camera, LoaderCircle, LogOut, Pencil } from "lucide-react"
import { ChangeEvent, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  updateBio as updateBioReducer,
  updateCoverImageUrl,
  updateProfileImageUrl,
} from "@/app/reducers/user"
import { toast } from "sonner"

const DEFAULT_COVER = "bmw-6706660_1280.jpg"

type CoverPhotoProps = {
  url?: string
  uploading: boolean
}

// Keyed by `url` at the call site so a finished upload remounts this and
// resets `loaded`. That keeps the placeholder up until the *new* image has
// actually decoded, rather than only until the upload request resolved -
// the window between those two is what used to flash the page background
// through the empty <img>.
const CoverPhoto = ({ url, uploading }: CoverPhotoProps) => {
  const [loaded, setLoaded] = useState(false)

  return (
    <>
      <img
        src={url}
        alt="cover photo"
        onLoad={() => setLoaded(true)}
        // Without this a broken/blocked image would spin forever.
        onError={() => setLoaded(true)}
        className={cn(
          "absolute inset-0 size-full object-cover transition-opacity duration-500",
          loaded ? "opacity-100" : "opacity-0"
        )}
      />
      {(!loaded || uploading) && <Spinner />}
    </>
  )
}

const Spinner = ({ className }: { className?: string }) => (
  <div
    className={cn(
      "absolute inset-0 grid place-items-center bg-black/40 text-white",
      className
    )}
  >
    <LoaderCircle className="animate-spin" />
  </div>
)

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="font-mono text-[11px] tracking-[0.08em] text-mute-2 uppercase">
    {children}
  </span>
)

const Profile = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useSelector((state: RootState) => state.user)
  const { isMobile, showBottomNav } = useAppShell()
  const logout = useLogout()
  const [isBioEditing, setIsBioEditing] = useState(false)
  const [bioDraft, setBioDraft] = useState("")

  const { data: postsResult } = useGetUserPostsQuery(user!.id)
  const [updateBio, { isLoading: savingBio }] = useUpdateBioMutation()
  const [uploadProfileImage, { isLoading: uploadingProfileImg }] =
    useUploadProfileImageMutation()
  const [uploadCoverImage, { isLoading: uploadingCoverImg }] =
    useUploadCoverImageMutation()

  const posts = postsResult?.posts ?? []

  const startBio = () => {
    setBioDraft(user?.bio ?? "")
    setIsBioEditing(true)
  }

  const saveBio = async () => {
    const bio = bioDraft.trim()

    if (!bio) {
      toast.error("Bio cannot be empty")
      return
    }

    if (bio !== user?.bio) {
      const result = await updateBio(bio)

      if ("error" in result) {
        toast.error("Couldn't update your bio")
        return
      }

      dispatch(updateBioReducer(result.data.user.bio))
    }

    setIsBioEditing(false)
  }

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("profileImage", file)

    const updatedUserData = await uploadProfileImage(formData)

    dispatch(updateProfileImageUrl(updatedUserData.data?.user.profileImgUrl))
  }

  const handleCoverChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("coverImage", file)

    const updatedUserData = await uploadCoverImage(formData)

    dispatch(updateCoverImageUrl(updatedUserData.data?.user.coverImgUrl))
  }

  // Every account starts on a stock cover URL (the schema default) - treat
  // that as "no cover yet". Checked by URL because the API never sends
  // coverImgPId to the client.
  const hasCover =
    !!user?.coverImgUrl && !user.coverImgUrl.includes(DEFAULT_COVER)

  return (
    <>
      <div className="overflow-hidden rounded-[20px] border border-line bg-surface">
        <div
          className={cn(
            "cover-placeholder relative grid place-items-center",
            isMobile ? "h-37.5" : "h-55"
          )}
        >
          <span className="font-mono text-xs tracking-[0.04em]">cover photo</span>
          {hasCover ? (
            <CoverPhoto
              key={user?.coverImgUrl}
              url={user?.coverImgUrl}
              uploading={uploadingCoverImg}
            />
          ) : (
            uploadingCoverImg && <Spinner />
          )}
          <label className="absolute right-4 bottom-4 flex h-9 cursor-pointer items-center gap-2 rounded-full border border-white/14 bg-[rgba(10,10,12,0.6)] px-3.5 text-[13.5px] font-medium whitespace-nowrap text-white backdrop-blur-sm hover:bg-[rgba(10,10,12,0.8)]">
            <Camera size={16} />
            Change cover
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              disabled={uploadingCoverImg}
              className="sr-only"
            />
          </label>
        </div>
        <div className="flex flex-wrap items-end gap-5 px-5 pb-6 sm:px-7">
          <label className="group relative z-1 -mt-14 size-28 flex-none cursor-pointer overflow-hidden rounded-full border-5 border-surface">
            <UserAvatar user={user} className="size-full text-[34px]" />
            {uploadingProfileImg ? (
              <Spinner className="rounded-full" />
            ) : (
              <div className="absolute inset-0 hidden place-items-center rounded-full bg-brand/60 text-white group-hover:grid">
                <Camera />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              aria-label="Change profile photo"
              onChange={handleImageUpload}
              disabled={uploadingProfileImg}
              className="sr-only"
            />
          </label>
          <div className="min-w-50 flex-1 pt-3.5">
            <div className="text-[26px] font-bold tracking-[-0.02em]">{user?.name}</div>
            <div className="mt-0.5 text-sm text-mute">
              @{user?.username} · Joined{" "}
              {formatHumanReadTimestamp(user?.createdAt as Date)}
            </div>
          </div>
          {/* The sidebar (and its Log out) is gone below 900px. */}
          {showBottomNav && (
            <button
              type="button"
              onClick={logout}
              className="flex h-9.5 flex-none cursor-pointer items-center gap-2 rounded-full border border-line-3 px-4.5 text-sm font-semibold whitespace-nowrap text-ink hover:bg-chip"
            >
              <LogOut size={16} />
              Log out
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-start gap-4">
        <aside className="flex max-w-full flex-[1_1_260px] flex-col gap-4.5 rounded-[18px] border border-line bg-surface p-5">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <FieldLabel>Bio</FieldLabel>
              {!isBioEditing && (
                <button
                  type="button"
                  onClick={startBio}
                  className="flex cursor-pointer items-center gap-1.5 py-0.5 text-[13px] text-ink-3b hover:text-ink"
                >
                  <Pencil size={13} />
                  Edit
                </button>
              )}
            </div>
            {isBioEditing ? (
              <>
                <textarea
                  autoFocus
                  value={bioDraft}
                  onChange={(e) => setBioDraft(e.target.value)}
                  rows={3}
                  placeholder="Add something about yourself"
                  className="w-full resize-y rounded-[10px] border border-line-3 bg-field px-3 py-2.5 text-[14.5px] leading-normal text-ink outline-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsBioEditing(false)}
                    className="h-8 cursor-pointer rounded-full px-3.5 text-[13.5px] text-ink-3b"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={saveBio}
                    disabled={savingBio}
                    className="h-8 cursor-pointer rounded-full bg-brand px-3.5 text-[13.5px] font-semibold text-white"
                  >
                    Save
                  </button>
                </div>
              </>
            ) : (
              <div
                className={cn(
                  "text-[15px] leading-normal whitespace-pre-line",
                  user?.bio ? "text-ink-2" : "text-mute-2"
                )}
              >
                {user?.bio || "Add something about yourself."}
              </div>
            )}
          </div>
          <div className="h-px bg-line" />
          <div className="flex flex-col gap-1">
            <FieldLabel>Email</FieldLabel>
            <span className="text-[14.5px] break-all text-ink-2">{user?.email}</span>
          </div>
          <div className="flex flex-col gap-1">
            <FieldLabel>Joined</FieldLabel>
            <span className="text-[14.5px] text-ink-2">
              {formatHumanReadTimestamp(user?.createdAt as Date)}
            </span>
          </div>
        </aside>

        <div className="flex min-w-0 flex-[2_1_360px] flex-col gap-3">
          <div className="flex items-center gap-1.5 px-1">
            <span className="text-[15px] font-semibold">Posts</span>
            <span className="text-[13px] text-mute-2">{posts.length}</span>
          </div>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} userId={user!.id} showAuthor={false} />
          ))}
        </div>
      </div>
    </>
  )
}
export default Profile
