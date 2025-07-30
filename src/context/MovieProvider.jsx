import { createContext } from "react";
import { useState } from "react";
import PropType from "prop-types";
import YouTube from "react-youtube";
import Modal from "react-modal";
Modal.setAppElement("#root");

// YouTube options
const opts = {
  height: "390",
  width: "640",
  playerVars: {
    // https://developers.google.com/youtube/player_parameters
    autoplay: 1,
  },
};

const MovieContext = createContext();
const MovieProvider = ({ children }) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [trailerKey, setTrailerKey] = useState("");
  const handleTrailer = async (id) => {
    setTrailerKey("");
    try {
      const url = `https://api.themoviedb.org/3/movie/${id}/videos?language=en-US`;

      const options = {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
        },
      };

      const response = await fetch(url, options);
      const result = await response.json();

      if (result.results && result.results.length > 0) {
        const youtubeVideo = result.results.find(
          (video) => video.site === "YouTube" && video.type === "Trailer"
        );
        if (youtubeVideo) {
          setTrailerKey(youtubeVideo.key);
          setModalIsOpen(true);
        } else {
          console.warn("No YouTube trailer found");
          setModalIsOpen(false);
        }
      } else {
        console.warn("No video results found");
        setModalIsOpen(false);
      }

      setModalIsOpen(true);
    } catch (error) {
      setModalIsOpen(false);
      console.error("Error fetching trailer:", error);
    }
  };
  return (
    <MovieContext.Provider value={{ handleTrailer }}>
      {children}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        style={{
          overlay: {
            position: "fixed",
            zIndex: 9999,
          },
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
          },
        }}
        contentLabel="Trailer Modal"
      >
        <YouTube videoId={trailerKey} opts={opts} />
      </Modal>
    </MovieContext.Provider>
  );
};
MovieProvider.propTypes = {
  children: PropType.node,
};

export { MovieProvider, MovieContext };
