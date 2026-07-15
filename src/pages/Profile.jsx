import "../App.css";
import profile from "../images/profile.png";

function Profile() {
  return (
    <div className="main">
      <h1>My Profile</h1>

      <div className="profile-card">

        <img
          src={profile}
          alt="Profile"
          className="profile-photo"
        />

        <h2>Takoyaki Izuno</h2>

        <p className="email"><b>Email :</b> takoyaki@example.com</p>
        <p className="role"><b>Role :</b> Reader</p>

        <button className="edit-btn">
          Edit Profile
        </button>

      </div>
    </div>
  );
}

export default Profile;