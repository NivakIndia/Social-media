import { useState } from "react";


const Functions = () => {

    /* Check is Image */
    const toCheckIsImage = ({ url }) => {
        if (!url) return false;
        return url.includes('.jpg') || url.includes('.png') || url.includes('.jpeg')
    }

    /* Check is Video */
    const toCheckIsVideo = ({ url }) => {
        if (!url) return false;
        return url.includes('.mp4') || url.includes('.mov') || url.includes('.avi')
    }

    /* Get The Time Difference */
    const toGetTimeDifference = ({ targetDate, targetTime, fullFormat }) => {
        const currentDate = new Date();
        const providedDate = new Date(`${targetDate}T${targetTime}`);
        const timeDifference = currentDate - providedDate;

        const seconds = Math.floor(timeDifference / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const months = Math.floor(days / 30);
        const years = Math.floor(days / 365);

        if (fullFormat) {
            if (seconds < 60) {
                return `${seconds}sec ago`;
            } else if (minutes < 60) {
                if (minutes === 1) {
                    return `${minutes}min ago`;
                } else {
                    return `${minutes}mins ago`;
                }
            } else if (hours < 24) {
                if (hours === 1) {
                    return `${hours}hour ago`;
                } else {
                    return `${hours}hours ago`;
                }
            } else if (days < 30) {
                if (days === 1) {
                    return `${days}day ago`;
                } else {
                    return `${days}days ago`;
                }
            } else if (months < 12) {
                if (months === 1) {
                    return `${months}month ago`;
                } else {
                    return `${months}months ago`;
                }
            } else {
                if (years === 1) {
                    return `${years}year ago`;
                } else {
                    return `${years}years ago`;
                }
            }
        }
        else {
            if (seconds < 60) {
                return `${seconds}s`;
            } else if (minutes < 60) {
                return `${minutes}min`
            } else if (hours < 24) {
                return `${hours}h`
            } else if (days < 30) {
                return `${days}d`
            } else if (months < 12) {
                return `${months}m`
            } else {
                return `${years}y`
            }
        }
    };


    /*To Shuffel Array*/
    const shuffleArray = (array) => {
        const shuffledPost = [...array]
        for (let i = shuffledPost?.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledPost[i], shuffledPost[j]] = [shuffledPost[j], shuffledPost[i]]

        }
        return shuffledPost
    }

    return {
        toCheckIsImage,                 /* MediaView -- OverlayPost -- FrontPost -- Explore */
        toCheckIsVideo,                 /* MediaView -- OverlayPost -- FrontPost -- Explore */
        toGetTimeDifference,            /* OverlayPost -- CommentDetails -- FrontPost */
        shuffleArray,                   /* Explore -- Reels */
    }


}

export default Functions