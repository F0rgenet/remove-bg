import React, {useEffect, useState} from 'react';
import {Storage} from "@plasmohq/storage";
import { Star as StarIcon } from "lucide-react"

function Star({ filled, index, onClick, onMouseEnter, onMouseLeave  }) {
    const colors = ["#007CFF", "#008BFB", "#0091D5", "#0093A1", "#00916A"]
    const starColor = filled?colors[index]:"#6C60F7";
    return (
        <StarIcon className="rating-star" color={starColor} fill={starColor} size={24} onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}/>
);
}

function RatingComponent() {
    const storage = new Storage();

    const [showRating, setShowRating] = useState(false);
    const [rating, setRating] = React.useState(0);

    useEffect(() => {
        const fetchData = async () => {
            // TODO: Переписать
            const count: number = await storage.get("UsageCount");
            const ratingClicked: boolean = await storage.get("RatingClicked");
            const ratingShowed: boolean = await storage.get("RatingShowed");
            if (((count === 10 || count == 1) || (ratingShowed)) && !ratingClicked) {
                setShowRating(true);
                await storage.set("RatingShowed", true);
            } else {
                setShowRating(false);
            }
            console.log(`COUNT: ${count} SHOW: ${showRating}`);
        };
        fetchData().then();
    }, []);

    if (!showRating) { return; }

    const handleStarClick = async (starIndex: number) => {
        let url = "https://forms.gle/HDEJhEhkEEcZhvc1A";
        if (starIndex > 2) {
            url = "https://forms.gle/HDEJhEhkEEcZhvc1A";
        }
        chrome.tabs.create({ url: url }).then()
        setShowRating(false);
        await storage.set("RatingClicked", true);
        await storage.set("RatingShowed", false);
    };

    const handleStarHover = (starIndex: number) => {
        setRating(starIndex + 1);
    };

    const handleStarLeave = () => {
        setRating(0);
    }


    return (
        <div className="rating">
            <hr id="rating-separator"/>
            <a className="tooltip-text" id="rating-tooltip">Rate us:</a>
            <div className="rating-stars">
                {[...Array(5)].map((_, index) => (
                    <Star
                        key={index}
                        filled={index < rating}
                        index={index}
                        onClick={() => handleStarClick(index)}
                        onMouseEnter={() => handleStarHover(index)}
                        onMouseLeave={() => handleStarLeave()}
                    />
                ))}
            </div>
        </div>
)}

export default RatingComponent