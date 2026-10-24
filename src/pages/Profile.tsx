/* Renders the editable profile details and profile photo controls. */
import type { ChangeEvent, RefObject } from 'react'
import type { interfaceText } from '../i18n'
import type { Profile as ProfileData } from '../types'

type ProfileProps = {
  text: typeof interfaceText.en
  username: string
  profile: ProfileData
  profilePhotoInputRef: RefObject<HTMLInputElement | null>
  onPhotoChange: (event: ChangeEvent<HTMLInputElement>) => void
  onUpdateProfile: (changes: Partial<ProfileData>) => void
  onRemovePhoto: () => void
}

export default function Profile({
  text,
  username,
  profile,
  profilePhotoInputRef,
  onPhotoChange,
  onUpdateProfile,
  onRemovePhoto,
}: ProfileProps) {
  return (
    <section className="content-section profile-section" aria-labelledby="profile-title">
      <div className="section-heading">
        <div>
          <p className="section-kicker">{text.yourStory}</p>
          <h2 id="profile-title">{text.profile}</h2>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {profile.photo
              ? <img src={profile.photo} alt={`${username}'s profile`} />
              : <span aria-hidden="true">{username.charAt(0)}</span>}
          </div>
          <div className="profile-identity">
            <h3>{username}</h3>
            <p>{text.student}</p>
            <div className="profile-photo-actions">
              <button
                className="primary-button"
                type="button"
                onClick={() => profilePhotoInputRef.current?.click()}
              >
                {profile.photo ? text.changePhoto : text.addPhoto}
              </button>
              {profile.photo && (
                <button className="text-button" type="button" onClick={onRemovePhoto}>
                  {text.removePhoto}
                </button>
              )}
              <input
                ref={profilePhotoInputRef}
                className="visually-hidden"
                type="file"
                accept="image/*"
                aria-label="Choose a profile photo"
                onChange={onPhotoChange}
              />
            </div>
            <small className="profile-help">{text.imageHelp}</small>
          </div>
        </div>

        <label className="profile-bio-field">
          {text.bio}
          <textarea
            value={profile.bio}
            maxLength={300}
            rows={4}
            placeholder={text.tellAboutYourself}
            onChange={(event) => onUpdateProfile({ bio: event.target.value })}
          />
          <span>{profile.bio.length}/300 characters</span>
        </label>
      </div>
    </section>
  )
}
