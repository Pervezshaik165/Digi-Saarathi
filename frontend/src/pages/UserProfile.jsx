import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import { FiEdit2, FiSave, FiCamera } from "react-icons/fi";
import defaultProfile from "../assets/default_profile.png";

const indianStates = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand",
  "Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur",
  "Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura",
  "Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu & Kashmir",
  "Ladakh","Puducherry","Chandigarh","Andaman & Nicobar","Dadra & Nagar Haveli",
  "Daman & Diu","Lakshadweep"
];

const UserProfile = () => {
  const { userProfile, setUserProfile, api, userToken, loadUserProfile } =
    useContext(AppContext);

  const [isEditing, setIsEditing] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [skillsInput, setSkillsInput] = useState("");

  if (!userProfile) {
    return (
      <div className="flex justify-center items-center w-full h-[70vh]">
        <p className="text-lg text-gray-600 animate-pulse">Loading profile...</p>
      </div>
    );
  }

const uploadImageToCloudinary = async (file) => {
  if (!file) return null;

  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", import.meta.env.VITE_CLOUDINARY_PRESET);
  data.append("folder", "digisaarathi/profiles");

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD}/auto/upload`,
    { method: "POST", body: data }
  );

  const json = await res.json();
  return json.secure_url;
};

  const saveProfile = async () => {
  try {
    let imageUrl = userProfile.image;

    if (imageFile) {
      const uploadedUrl = await uploadImageToCloudinary(imageFile);
      if (uploadedUrl) imageUrl = uploadedUrl;
    }

    const payload = {
      name: userProfile.name,
      phone: userProfile.phone || "",
      gender: userProfile.gender || "",
      dob: userProfile.dob || "",
      originState: userProfile.originState || "",
      originDistrict: userProfile.originDistrict || "",
      currentState: userProfile.currentState || "",
      currentDistrict: userProfile.currentDistrict || "",
      address: userProfile.address || "",
      skills: userProfile.skills || [],
      presentCity: userProfile.presentCity || "",
      experience: userProfile.experience || "",
      image: imageUrl
    };

    const { data } = await api.put(
      "/api/user/update-profile",
      payload,
      {
        headers: { Authorization: `Bearer ${userToken}` }
      }
    );

    if (data.success) {
      toast.success("Profile Updated!");
      loadUserProfile();
      setIsEditing(false);
    } else {
      toast.error(data.message);
    }
  } catch (err) {
    toast.error("Update failed");
    console.log(err);
  }
};

  const addSkill = () => {
    if (!skillsInput.trim()) return;

    setUserProfile((prev) => ({
      ...prev,
      skills: [...(prev.skills || []), skillsInput.trim()],
    }));

    setSkillsInput("");
  };

  const removeSkill = (i) => {
    setUserProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, index) => index !== i),
    }));
  };

  return (
    <div className="flex justify-center mt-8 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-3xl w-full">

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">My Profile</h2>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg"
            >
              <FiEdit2 /> Edit
            </button>
          ) : (
            <button
              onClick={saveProfile}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg"
            >
              <FiSave /> Save
            </button>
          )}
        </div>

        <div className="flex justify-center mb-6 relative">
          <img
            src={
              imageFile
                ? URL.createObjectURL(imageFile)
                : userProfile.image || defaultProfile
            }
            className="w-32 h-32 rounded-full object-cover border shadow"
          />

          {isEditing && (
            <label className="absolute bottom-1 right-1 bg-primary p-2 rounded-full cursor-pointer text-white">
              <FiCamera className="text-xl" />
              <input
                type="file"
                hidden
                onChange={(e) => setImageFile(e.target.files[0])}
              />
            </label>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <div>
            <label className="font-medium">Full Name</label>
            <input
              disabled={!isEditing}
              value={userProfile.name}
              onChange={(e) =>
                setUserProfile((p) => ({ ...p, name: e.target.value }))
              }
              className="w-full border p-2 rounded mt-1"
            />
          </div>

          <div>
            <label className="font-medium">Phone</label>
            <input
              disabled={!isEditing}
              value={userProfile.phone || ""}
              onChange={(e) =>
                setUserProfile((p) => ({ ...p, phone: e.target.value }))
              }
              className="w-full border p-2 rounded mt-1"
            />
          </div>

          <div>
            <label className="font-medium">Email</label>
            <input
              disabled
              value={userProfile.email}
              className="w-full border p-2 rounded mt-1 bg-gray-100"
            />
          </div>

          <div>
            <label className="font-medium">Date of Birth</label>
            <input
              type="date"
              disabled={!isEditing}
              value={userProfile.dob || ""}
              onChange={(e) =>
                setUserProfile((p) => ({ ...p, dob: e.target.value }))
              }
              className="w-full border p-2 rounded mt-1"
            />
          </div>

          <div>
            <label className="font-medium">Gender</label>
            <select
              disabled={!isEditing}
              value={userProfile.gender || ""}
              onChange={(e) =>
                setUserProfile((p) => ({ ...p, gender: e.target.value }))
              }
              className="w-full border p-2 rounded mt-1"
            >
              <option>Not Selected</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="font-medium">Origin State</label>
            <select
              disabled={!isEditing}
              value={userProfile.originState || ""}
              onChange={(e) =>
                setUserProfile((p) => ({ ...p, originState: e.target.value }))
              }
              className="w-full border p-2 rounded mt-1"
            >
              {indianStates.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-medium">Origin District</label>
            <input
              disabled={!isEditing}
              value={userProfile.originDistrict || ""}
              onChange={(e) =>
                setUserProfile((p) => ({ ...p, originDistrict: e.target.value }))
              }
              className="w-full border p-2 rounded mt-1"
            />
          </div>

          <div>
            <label className="font-medium">Current State</label>
            <select
              disabled={!isEditing}
              value={userProfile.currentState || ""}
              onChange={(e) =>
                setUserProfile((p) => ({ ...p, currentState: e.target.value }))
              }
              className="w-full border p-2 rounded mt-1"
            >
              {indianStates.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-medium">Current District</label>
            <input
              disabled={!isEditing}
              value={userProfile.currentDistrict || ""}
              onChange={(e) =>
                setUserProfile((p) => ({ ...p, currentDistrict: e.target.value }))
              }
              className="w-full border p-2 rounded mt-1"
            />
          </div>

          <div>
            <label className="font-medium">Present City</label>
            <input
              disabled={!isEditing}
              value={userProfile.presentCity || ""}
              onChange={(e) =>
                setUserProfile((p) => ({ ...p, presentCity: e.target.value }))
              }
              className="w-full border p-2 rounded mt-1"
            />
          </div>

          <div className="md:col-span-2">
            <label className="font-medium">Experience</label>
            <input
              disabled={!isEditing}
              value={userProfile.experience || ""}
              onChange={(e) =>
                setUserProfile((p) => ({ ...p, experience: e.target.value }))
              }
              placeholder="e.g., 5 years electrician / carpentry / plumber or brief summary"
              className="w-full border p-2 rounded mt-1"
            />
          </div>

        </div>

        <div className="mt-5">
          <label className="font-medium">Full Address</label>
          <textarea
            disabled={!isEditing}
            value={userProfile.address || ""}
            onChange={(e) =>
              setUserProfile((p) => ({ ...p, address: e.target.value }))
            }
            className="w-full border p-2 rounded mt-1"
          />
        </div>

        <div className="mt-5">
          <label className="font-medium">Skills</label>

          {isEditing && (
            <div className="flex gap-2 mt-1">
              <input
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                className="border p-2 rounded flex-1"
                placeholder="Add a skill"
              />
              <button
                onClick={addSkill}
                className="px-4 bg-primary text-white rounded"
              >
                Add
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mt-3">
            {userProfile.skills?.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-200 rounded-full flex items-center gap-2"
              >
                {skill}
                {isEditing && (
                  <button
                    className="text-red-600"
                    onClick={() => removeSkill(index)}
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserProfile;
