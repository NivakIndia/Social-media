import React, { useEffect, useState } from 'react';
import "./MentionTextArea.css"
import ApiFunctions from '../ApiFunctions';

const MentionTextArea = ({
    className,
    message,
    setMessage,
    placeholder = "Type here",
    popupPosition = 'top',
    rows = 1,
    isEditable = true
}) => {
    const [suggestions, setSuggestions] = useState();
    const [users, setusers] = useState()
    const {toGetSuggestions} = ApiFunctions();
    const handleChange = (e) => {
        setMessage(e.target.value);

        // Detect when '@' is typed and show suggestions
        const mentionRegex = /@([a-zA-Z0-9_]{1,})$/;
        const match = e.target.value.match(mentionRegex);

        if (match) {
            const searchTerm = match[1];
            const filteredUsers = users.filter((user) => (user.userName.toLowerCase().includes(searchTerm) || user.fullName.toLowerCase().includes(searchTerm)));
            setSuggestions(filteredUsers);
        } else {
            setSuggestions();
        }
    };

    const handleSuggestionClick = (user) => {
        setMessage(`${message.substring(0, message.lastIndexOf('@') + 1)}${user} `);
        setSuggestions();
    };

    /* Fetch User Mentions */
    useEffect(() => {
        const fetchUsernames = async () => {
            try {
                setusers((await toGetSuggestions()).data.data);
            } catch (error) {
                console.error("Error fetching mentions: ", error);
            }
        };
        fetchUsernames();
    }, []);

    return (
        <div className='mention'>
            <textarea
                className={`${className} mention_textarea`}
                value={message}
                onChange={handleChange}
                placeholder={placeholder}
                disabled={!isEditable}
            />
            {suggestions && suggestions.length > 0 && (
                <ul className={`suggestions-list ${popupPosition}`}>
                    {suggestions.map((suggestion, index) => (
                        <li
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion.userName)}
                        >
                            <div className='mention_top'>
                                <div className='mention_top_avatar'>
                                    <a href={`/account/profile/${suggestion?.id}/`}>
                                        <img src={suggestion?.profileURL || '/profile.png'} alt="profile" />
                                    </a>
                                </div>
                                <div className='mention_top_content'>
                                    <p>{suggestion?.userName}</p>
                                    <span>{suggestion?.fullName}</span>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default MentionTextArea;
