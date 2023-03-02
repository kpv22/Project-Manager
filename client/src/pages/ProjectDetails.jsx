import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { useState, useEffect } from "react";
import { BsCheck2All } from "react-icons/bs";
import {
  DELETED_PROJECT,
  GET_PROJECT,
  UPDATED_PROJECT,
} from "../graphql/projects";
import { TasksList } from "../components/tasks/TasksList";
import { TasksForm } from "../components/tasks/TasksForm";
import { Loading } from "../components/Loading/Loading";
import Swal from "sweetalert2";
import { AiOutlineCheck, AiOutlineEdit, AiOutlineClose } from "react-icons/ai";

export function ProjectDetails() {
  const params = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [updateTitle, setUpdatedTitle] = useState("");
  const [description, setDescription] = useState("");
  const [updateDescription, setUpdateDescription] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (data && data.project.name && data.project.description) {
      setTitle(data.project.name);
      setDescription(data.project.description);
    }
  });

  const handleEditClick = () => {
    setEditing(true);
  };

  const { data, loading, error } = useQuery(GET_PROJECT, {
    variables: {
      id: params.id,
    },
  });
  const [updateProject] = useMutation(UPDATED_PROJECT, {
    refetchQueries: ["getProject", "getProjects"],
  });

  const [deleteProject] = useMutation(DELETED_PROJECT, {
    refetchQueries: ["getProjects", "getProject"],
    onCompleted: () => {
      navigate("/projects");
    },
  });

  const handleDeleteProject = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#30d664",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      background: "#191919",
      color: "white",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteProject({
          variables: { id: data.project._id },
        });
      }
    });
  };

  const handleCancelClick = () => {
    setEditing(false);
    setTitle(title);
    setUpdatedTitle(title); // agregar esta línea
  };

  const handleSaveClick = () => {
    if (title !== updateTitle || description !== updateDescription) {
      updateProject({
        variables: {
          id: data.project._id,
          name: updateTitle,
          description: updateDescription,
        },
      });
      setTitle(updateTitle);
      setDescription(updateDescription);
    }
    setEditing(false);
  };

  const handleTitleChange = (e) => {
    setUpdatedTitle(e.target.innerText);
    setUpdateDescription(description);
  };

  const handleDescriptionChange = (e) => {
    setUpdateDescription(e.target.innerText);
    setUpdatedTitle(title);
  };

  if (loading)
    return (
      <div>
        <Loading />
      </div>
    );

  if (error) return <p>{error.message}</p>;
  if (!data || !data.project || !data.project.name) {
    return <p>Not Project Found</p>;
  }
  return (
    <div style={{ width: "80%" }}>
      <div className="flex justify-between mb-2">
        <Link to="/projects">
          <button className="bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-400">
            Back
          </button>
        </Link>
        <button
          className="bg-red-500 px-3 py-2 rounded-lg hover:bg-red-400"
          onClick={handleDeleteProject}
        >
          Delete
        </button>
      </div>

      <div
        className={`bg-zinc-900 ${
          editing ? "bg-zinc-700 border border-white border-opacity-20" : ""
        }mb-2 p-5 flex justify-between w-full rounded-lg h-50`}
      >
        <div>
          <h1 className="text-gray-500">Title</h1>
          <h1
            className={`outline-none text-sm ${
              editing ? "bg-transparent" : ""
            }`}
            contentEditable={editing}
            suppressContentEditableWarning={true}
            onInput={handleTitleChange}
          >
            {data.project.name}
          </h1>
          <h1 className="text-gray-500">Description</h1>
          <p
            className={`outline-none text-sm ${
              editing ? "bg-transparent" : ""
            }`}
            contentEditable={editing}
            suppressContentEditableWarning={true}
            onInput={handleDescriptionChange}
          >
            {data.project.description}
          </p>
        </div>
        <div>
          {!editing && (
            <button
              class="ml-auto mb-auto p-2 rounded-md shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
              onClick={handleEditClick}
            >
              <AiOutlineEdit />
            </button>
          )}
          {editing && (
            <>
              <button
                className="mx-1 shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
                onClick={handleSaveClick}
              >
                <BsCheck2All />
              </button>
              <button
                className="mx-1 shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
                onClick={handleCancelClick}
              >
                <AiOutlineClose />
              </button>
            </>
          )}
        </div>
      </div>

      <div>
        <div>
          <TasksForm />
        </div>
        <div class="h-96 scroll-container overflow-y-auto scrollbar-w-2 scrollbar-track-gray-100 scrollbar-thumb-gray-300">
          <TasksList tasks={data.project.tasks} />
        </div>
      </div>
    </div>
  );
}
