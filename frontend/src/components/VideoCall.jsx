import React, { useEffect, useState } from 'react';
import {
    StreamVideo,
    StreamVideoClient,
    StreamCall,
    StreamTheme,
    SpeakerLayout,
    CallControls,
    CallParticipantsList,
    useCallStateHooks,
} from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css';
import axios from 'axios';
import { ChatState } from '../context/ChatProvider';

const VideoCall = ({ chatId, onClose, isVideoCall = true }) => {
    const [client, setClient] = useState(null);
    const [call, setCall] = useState(null);
    const { user } = ChatState();

    useEffect(() => {
        const initCall = async () => {
            try {
                // 1. Fetch Token
                const config = {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                };
                const { data } = await axios.get('/api/stream/token', config);
                const { token, apiKey, user: streamUser } = data;

                if (!apiKey) {
                    console.error("Stream API Key missing");
                    return;
                }

                // 2. Initialize Client
                const newClient = new StreamVideoClient({
                    apiKey,
                    user: {
                        id: streamUser.id,
                        name: streamUser.name,
                        image: streamUser.image,
                    },
                    token,
                });
                setClient(newClient);

                // 3. Create/Join Call
                // We use the chatId as the unique call ID so everyone in the chat joins the same call
                const newCall = newClient.call('default', chatId);
                await newCall.join({ create: true });
                setCall(newCall);

            } catch (error) {
                console.error('Error initializing video call:', error);
                alert('Failed to start call: ' + (error.response?.data?.message || error.message));
                onClose();
            }
        };

        if (user && chatId) {
            initCall();
        }

        return () => {
            if (call) {
                call.leave();
            }
            if (client) {
                client.disconnectUser();
            }
        };
    }, [chatId, user]);

    if (!client || !call) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
                <div className="text-white flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
                    <p>Initializing secure connection...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
            <StreamVideo client={client}>
                <StreamTheme>
                    <StreamCall call={call}>
                        <div className="relative w-full h-full flex flex-col">
                            {/* Header */}
                            <div className="absolute top-4 left-4 z-10">
                                <button
                                    onClick={() => {
                                        call.leave();
                                        onClose();
                                    }}
                                    className="bg-red-500/20 hover:bg-red-500/40 text-red-400 px-4 py-2 rounded-lg backdrop-blur-md border border-red-500/30 transition-all"
                                >
                                    <i className="fas fa-arrow-left mr-2"></i> Back to Chat
                                </button>
                            </div>

                            {/* Main Video Area */}
                            <div className="flex-1 flex items-center justify-center p-4">
                                <SpeakerLayout participantsBarPosition="bottom" />
                            </div>

                            {/* Controls */}
                            <div className="pb-8 flex justify-center">
                                <CallControls
                                    onLeave={() => {
                                        onClose();
                                    }}
                                />
                            </div>
                        </div>
                    </StreamCall>
                </StreamTheme>
            </StreamVideo>
        </div>
    );
};

export default VideoCall;
