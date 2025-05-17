import React, { useState, useEffect, useRef } from 'react';
import api from "../api/axiosConfig";
import './InputWithMention.css';
import ApiFunctions from '../ApiFunctions';

const InputWithMention = ({ 
    className, 
    message, 
    setMessage, 
    placeholder = "Type here", 
    popupPosition = 'top', 
    rows = 1, 
    isEditable = true 
}) => {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState();
    const [filteredSuggestions, setFilteredSuggestions] = useState();
    const [hasStartedTyping, setHasStartedTyping] = useState(false);
    const inputRef = useRef(null);
    const {toGetSuggestions} = ApiFunctions();
    const currentMentionRef = useRef(''); // To track the current mention being typed

    /* Fetch User Mentions */
    useEffect(() => {
        const fetchUsernames = async () => {
            try {
                setSuggestions((await toGetSuggestions()).data.data);
            } catch (error) {
                console.error("Error fetching mentions:", error);
            }
        };  
        fetchUsernames();
    }, []);

    /* Update Content Editable */
    useEffect(() => {
        inputRef.current.innerHTML = commentWithMention(message);
        if (isEditable && message) {
            placeCaretAtEnd(inputRef.current);
        }
    }, [message, placeholder, isEditable, hasStartedTyping]);

    const placeCaretAtEnd = (element) => {
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(element);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
    };

    const handleChange = (e) => {
        const selection = window.getSelection();
    
        // Check if there's a selection
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0); // Get the current range
            const startOffset = range.startOffset; // Start offset of the cursor
            const endOffset = range.endOffset; // End offset of the cursor
            
            console.log('Cursor position:', startOffset, endOffset); // Log the cursor position
        }
        const text = inputRef.current.innerText;
        setMessage(text)
        setHasStartedTyping(true);

        const matches = text.match(/@\w*$/);
        const lastMention = matches ? matches[0] : '';
        
        if (lastMention && lastMention.startsWith('@') && suggestions.length > 0) {
            currentMentionRef.current = lastMention.slice(1).toLowerCase();
            const filtered = suggestions.filter(suggest =>
                suggest.userName && suggest.userName.toLowerCase().includes(currentMentionRef.current)
            );
            setFilteredSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (username) => {
        const newMessage = message.replace(/@\w*$/, `@${username}`);
        setMessage(newMessage+" ");
        setShowSuggestions(false);

        setTimeout(() => {
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(inputRef.current);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
            document.execCommand("insertText", false, " ");
        }, 0);
    };

    const commentWithMention = (msg) => {
        if (!msg) return '';  // Check for undefined or null message
        const regex = /@(\w+)/g;
        return msg.replace(regex, (match, username) => {
            if(suggestions === undefined) return "";
            
            const mention = suggestions.find(user => user.userName === username);
            if (mention) {
                return `<a href="/account/profile/${mention.id}/" style='color:var(--button-color)'>@${username}</a>`;
            }
            return `@${username}`;
        });
    };

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {showSuggestions && (
                <ul className={`suggestions-list ${popupPosition}`}>
                    {filteredSuggestions.map((suggestion, index) => (
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
            <div
                ref={inputRef}
                contentEditable={isEditable}
                className={`${className} comment-editable ${!message ? 'empty' : ''}`}
                dangerouslySetInnerHTML={{ __html: commentWithMention(message)}}
                onInput={handleChange}
                data-placeholder={placeholder}
            ></div>     
        </div>
    );
};

export default InputWithMention;
