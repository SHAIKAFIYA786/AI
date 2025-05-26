import React, { useContext, useState } from 'react'
import { UserContext } from '../context/user.context'
import { useLocation } from 'react-router-dom'
import gsap from 'gsap';
import { useRef } from 'react';
import { useEffect } from 'react';
import axios from '../config/axios';
import { Socket } from 'socket.io-client';
import { initializeSocket, receiveMessage, sendMessage } from '../config/socket.io'
import SyntaxHighlightedCode from '../components/SyntaxHighlightedCode'; // adjust path as needed
import Markdown from 'markdown-to-jsx';
import hljs from 'highlight.js'
// import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import { WebContainer } from '@webcontainer/api';
import { getWebContainer } from '../config/webContainer';

const Project = () => {
    const location = useLocation()
    const { user } = useContext(UserContext)
    const projects = location.state?.project
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedUserId, setSelectedUserId] = useState(new Set())
    const [project, setProject] = useState(location.state.project)
    const [Users, setUsers] = useState([])
    const sidePanelRef = useRef(null)
    const [message, setMessage] = useState('')
    const [messages, setMessages] = useState([])
    const messageBoxRef = useRef(null);
    const [openFiles, setOpenFiles] = useState([]); // Array of file names
    const [webContainer, setwebContainer] = useState(null);
    const [iframeUrl, setIframeUrl] = useState(null)

    const [runProcess, setRunProcess] = useState(null)

    const [fileTree, setFileTree] = useState({
    })

    const [currentFile, setCurrentFile] = useState(null)

    console.log(user)
    useEffect(() => {
        if (messageBoxRef.current) {
            messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
        }
    }, [messages]);

    const handleUserClick = (id) => {
        setSelectedUserId(prevSelectedUserId => {
            const newSelectedUserId = new Set(prevSelectedUserId);
            if (newSelectedUserId.has(id)) {
                newSelectedUserId.delete(id);
            } else {
                newSelectedUserId.add(id);
            }

            return newSelectedUserId;
        });
    }

    function addCollaborators() {

        axios.put("/projects/add-user", {
            projectId: location.state.project._id,
            users: Array.from(selectedUserId)
        }).then(res => {
            console.log(res.data)
            setIsModalOpen(false)

        }).catch(err => {
            console.log(err)
        })

    }

    function WriteAiMessage(message) {
        const messageObject = JSON.parse(message);

        return (
            <div className="overflow-auto bg-slate-950 text-white rounded-sm p-2">
                <Markdown
                    children={messageObject.text}
                    options={{
                        overrides: {
                            code: SyntaxHighlightedCode,
                        },
                    }}
                />
            </div>
        );
    }

    function send() {
        if (!message.trim()) return;

        const newMessage = {
            message,
            sender: user,
            self: true, // mark it as sent by the current user
        };

        // Emit to server
        sendMessage('project-message', newMessage);

        // Add to local message list
        setMessages((prev) => [...prev, newMessage]);

        setMessage("");
    }

    //for recieve a message

    useEffect(() => {
        initializeSocket(project._id);
        if (!webContainer) {
            getWebContainer().then(container => {
                setwebContainer(container);
                console.log("container started")
            })
        }

        // const messageHandler = (data) => {
        //     let message;
        //     try {
        //         message = typeof data.message === "string"
        //             ? JSON.parse(data.message)
        //             : data.message;
        //     } catch (err) {
        //         console.error("Failed to parse message:", err);
        //     }

        //     console.log("received a message", data);

        //     if (webContainer && message.fileTree) {
        //         webContainer.mount(message.fileTree);
        //     }

        //     if (message.fileTree) {
        //         setFileTree(message.fileTree);
        //     }

        //     setMessages((prev) => [
        //         ...prev,
        //         {
        //             ...data,
        //             self: data.sender === user._id,
        //         },
        //     ]);
        // };
 const messageHandler = (data) => {
  let message;

  try {
    // Parse if message is stringified JSON, otherwise use as is
    message = typeof data.message === "string"
      ? JSON.parse(data.message)
      : data.message;
  } catch (err) {
    console.error("Failed to parse message:", err);
    // If parsing fails, fallback to the raw message string
    message = data.message;
  }

  console.log("received a message", data);

  // Check if the message contains a fileTree (file/folder structure)
  if (message && typeof message === "object" && message.fileTree) {
    if (webContainer) {
      webContainer.mount(message.fileTree);
    }
    setFileTree(message.fileTree);

    // Add the fileTree message to your messages state
    setMessages((prev) => [
      ...prev,
      {
        ...data,
        self: data.sender === user._id,
        type: "fileTree",
        content: message.fileTree,
      },
    ]);
  } else {
    // For normal messages or other types, just store the message content as is
    setMessages((prev) => [
      ...prev,
      {
        ...data,
        self: data.sender === user._id,
        type: "text",
        content: message,
      },
    ]);
  }
};


        receiveMessage('project-message', messageHandler);

        // Cleanup listener on unmount
        return () => {
            if (socketInstance) {
                socketInstance.off('project-message', messageHandler);
            }
        };
    }, [project._id]);     // add project._id as dependency if it can change

    // getting the projects to home apge
    useEffect(() => {
        axios.get(`/projects/get-project/${location.state.project._id}`)
            .then(res => {
                console.log(res.data.project);
                setProject(res.data.project);
            });

        axios.get('/users/all')
            .then(res => {
                console.log(res.data);
                setUsers(res.data.users);
            })
            .catch(err => {
                console.log(err);
            });
    }, []);
    function saveFileTree(ft) {
        axios.put('/projects/update-file-tree', {
            projectId: project._id,
            fileTree: ft
        }).then(res => {
            console.log(res.data)
        }).catch(err => {
            console.log(err)
        })
    }

    useEffect(() => {
        if (isSidePanelOpen) {
            gsap.to(sidePanelRef.current, {
                x: 0,
                duration: 0.8,
                ease: "power3.out"
            })
        } else {
            gsap.to(sidePanelRef.current, {
                x: "-100%",
                duration: 0.8,
                ease: "power3.in"
            })
        }
    }, [isSidePanelOpen])

    return (
        <main className='h-screen w-screen flex'>
            <section className="left relative flex flex-col h-screen min-w-96 bg-slate-300">
                <header className='flex justify-between items-center p-2 px-4 w-full bg-slate-100 absolute z-10 top-0'>
                    <button className='flex gap-2' onClick={() => setIsModalOpen(true)}>
                        <i className="ri-add-fill mr-1"></i>
                        <p>Add collaborator</p>
                    </button>
                    <button onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} className='p-2'>
                        <i className="ri-group-fill"></i>
                    </button>
                </header>
                <div
                    ref={messageBoxRef} className="conversation-area pt-14 pb-10 flex-grow flex flex-col h-full relative">
                    <div className="message-box p-1 flex-grow flex flex-col gap-1 overflow-auto max-h-full scrollbar-hide">
                        {messages.map((msg, index) => {
                            const isAI = msg.sender._id === "ai";
                            const isSelf = msg.sender._id === user._id.toString();

                            return (
                                <div
                                    key={index}
                                    className={`
          message flex flex-col p-2 w-fit rounded- md
          ${isSelf ? "bg-slate-50 self-end" : " bg-slate-900 text-white self-start"}
          ${isAI ? "max-w-80  bg-slate-900 text-white" : "max-w-52"}
        `}
                                >
                                    <small className="opacity-65 text-xs">{msg.sender.email}</small>
                                    <div className="text-sm break-words">
                                        {isAI ? WriteAiMessage(msg.message) : <p>{msg.message}</p>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="inputField w-full flex absolute bottom-0">
                        <input
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="p-2 px-4 border-none outline-none flex-grow"
                            type="text"
                            placeholder="Enter message"
                        />
                        <button
                            onClick={() => send()}
                            className="px-5 bg-slate-950 text-white"
                        >
                            <i className="ri-send-plane-fill"></i>
                        </button>
                    </div>

                </div>
                <div
                    ref={sidePanelRef} className={`sidePanel w-full h-full flex flex-col gap-2 bg-slate-50 absolute -translate-x-full top-0`}>
                    <header className='flex justify-between items-center px-4 p-2 bg-slate-200'>
                        <h1 className='font-semibold text-lg'>Collaborators</h1>
                        <button className='p-2'>
                            <i className="ri-close-fill"></i>
                        </button>
                    </header>
                    {projects.users && projects.users.map((user, index) => (
                        <div key={user._id} className="user cursor-pointer hover:bg-slate-200 p-2 flex gap-2 items-center">
                            <div className='aspect-square rounded-full w-10 h-10 flex items-center justify-center text-white bg-slate-600'>
                                <i className="ri-user-fill text-xl"></i>
                            </div>
                            <h1 className='font-semibold text-lg text-black'>{user.email}</h1>
                        </div>
                    ))}


                </div>
            </section>

            <section className="right flex gap-4 p-4">
    {/* File Tree */}
    <div className="file-tree bg-slate-200 text-black rounded-lg p-2 w-60 shadow-md">
        {Object.keys(fileTree).map((file, index) => (
            <div
                key={index}
                className="tree-element flex items-center space-x-1 hover:bg-gray-700 hover:text-white p-2 rounded cursor-pointer transition-colors"
                onClick={() => {
                    setCurrentFile(file);
                    if (!openFiles.includes(file)) {
                        setOpenFiles([...openFiles, file]);
                    }
                }}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-yellow-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path d="M2 4a2 2 0 012-2h4.586A2 2 0 0110 2.586l1.707 1.707A1 1 0 0012.414 5H16a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V4z" />
                </svg>
                <p className="text-sm font-medium">{file}</p>
            </div>
        ))}
    </div>

    {/* Code Editor Area */}
    <div className="code-editor flex flex-col w-full">
        {/* Tabs & Run Button */}
        <div className="tabs flex w-full justify-between">
            <div className="flex gap-2 border-b border-gray-300 p-2 bg-gray-100 rounded-t-md w-full overflow-x-auto">
                {openFiles.map((file, index) => (
                    <div
                        key={index}
                        className={`px-3 py-1 rounded-t-md cursor-pointer text-sm font-medium ${
                            currentFile === file
                                ? "bg-white border border-b-0 border-gray-300"
                                : "bg-gray-200"
                        }`}
                        onClick={() => setCurrentFile(file)}
                    >
                        {file}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setOpenFiles(openFiles.filter((f) => f !== file));
                                if (currentFile === file) {
                                    setCurrentFile(
                                        openFiles.length > 1
                                            ? openFiles.find((f) => f !== file)
                                            : null
                                    );
                                }
                            }}
                            className="ml-2 text-red-500 hover:text-red-700 text-xs"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>

            {/* Run Button */}
            <div className="actions flex gap-2 items-center px-2">
                <button
                    onClick={async () => {
                        saveFileTree(fileTree);

                        if (runProcess) {
                            runProcess.kill();
                            await new Promise((res) => setTimeout(res, 300));
                        }

                        await webContainer.mount(fileTree);

                        const installProcess = await webContainer.spawn("npm", ["install"]);
                        installProcess.output.pipeTo(
                            new WritableStream({
                                write(chunk) {
                                    console.log("Installing:", chunk);
                                },
                            })
                        );
                        await installProcess.exit;

                        const tempRunProcess = await webContainer.spawn("npm", ["start"]);
                        tempRunProcess.output.pipeTo(
                            new WritableStream({
                                write(chunk) {
                                    console.log("Server:", chunk);
                                },
                            })
                        );
                        setRunProcess(tempRunProcess);

                        webContainer.on("server-ready", (port, url) => {
                            console.log("Server ready at:", port, url);
                            setIframeUrl(url);
                        });
                    }}
                    className="p-2 px-4 bg-slate-300 text-white rounded shadow hover:bg-slate-400"
                >
                    Run
                </button>
            </div>
        </div>

        {/* Code Content or Editor */}
        {currentFile ? (
            <div className="p-2 border border-t-0 border-gray-300 bg-white shadow-md rounded-b-md w-full">
                <h1 className="text-base font-semibold text-gray-800 mb-2">{currentFile}</h1>
                <textarea
                    value={fileTree[currentFile]?.file?.contents || ""}
                    onChange={(e) => {
                        const updatedFileTree = {
                            ...fileTree,
                            [currentFile]: {
                                ...fileTree[currentFile],
                                file: {
                                    ...fileTree[currentFile].file,
                                    contents: e.target.value,
                                },
                            },
                        };
                        setFileTree(updatedFileTree);
                        saveFileTree(updatedFileTree);
                    }}
                    className="w-full h-96 font-mono text-sm text-gray-800 border rounded p-2 resize-none"
                />
            </div>
        ) : (
            <p className="text-gray-400 text-sm text-center mt-10">
                Select a file from the left to view its contents
            </p>
        )}
    </div>

    {/* Live Preview Area */}
    {iframeUrl && webContainer && (
        <div className="flex min-w-96 flex-col h-full">
            <div className="address-bar">
                <input
                    type="text"
                    onChange={(e) => setIframeUrl(e.target.value)}
                    value={iframeUrl}
                    className="w-full p-2 px-4 bg-slate-200"
                />
            </div>
            <iframe src={iframeUrl} className="w-full h-full border border-gray-300"></iframe>
        </div>
    )}
</section>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-4 rounded-md w-96 max-w-full relative">
                        <header className='flex justify-between items-center mb-4'>
                            <h2 className='text-xl font-semibold'>Select User</h2>
                            <button onClick={() => setIsModalOpen(false)} className='p-2'>
                                <i className="ri-close-fill"></i>
                            </button>
                        </header>
                        {/* <div className="users-list flex flex-col gap-2 mb-16 max-h-96 overflow-auto">
                            {Users.map(user => (
                                <div key={user._id} className={`user cursor-pointer hover:bg-slate-200 ${Array.from(selectedUserId).indexOf(user._id) != -1 ? 'bg-slate-200' : ""} p-2 flex gap-2 items-center`} onClick={() => handleUserClick(user._id)}>
                                    <div className='aspect-square relative rounded-full w-fit h-fit flex items-center justify-center p-5 text-white bg-slate-600'>
                                        <i className="ri-user-fill absolute"></i>
                                    </div>
                                    <h1 className='font-semibold text-lg'>{user.email}</h1>
                                </div>
                            ))}
                        </div> */}
                        <div className="users-list flex flex-col gap-2 mb-16 max-h-96 overflow-auto">
                            {Users.map(user => (
                                <div
                                    key={user._id}
                                    className={`user cursor-pointer ${selectedUserId.has(user._id) ? 'bg-slate-500' : 'bg-white'
                                        } hover:bg-slate-100 p-2 flex gap-2 items-center transition-colors duration-200`}
                                    onClick={() => handleUserClick(user._id)}
                                >
                                    <div className='aspect-square relative rounded-full w-fit h-fit flex items-center justify-center p-5 text-white bg-slate-600'>
                                        <i className="ri-user-fill absolute"></i>
                                    </div>
                                    <h1 className='font-semibold text-lg'>{user.email}</h1>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={addCollaborators}
                            className='absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-blue-600 text-white rounded-md'>
                            Add Collaborators
                        </button>
                    </div>
                </div>
            )}
        </main>
    )
}

export default Project
