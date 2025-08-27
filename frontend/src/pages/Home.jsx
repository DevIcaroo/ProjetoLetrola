import React, { useState, useRef } from "react";
import "../styles/Home.css";
import { useNavigate } from "react-router-dom";

function Home() {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [name, setName] = useState("");
    const inputRef = useRef(null);

    const handleStart = () => {
        setIsModalOpen(true);
    };

    const handleClose = () => {
        setIsModalOpen(false);
    };

    const handleContinue = () => {
        if (name.trim() !== "") {
            navigate("/mapa-do-jogo", { state: { playerName: name } });
        } else {
            alert("Por favor, insira seu nome.");
        }
     };

     const handleInputChange = (e) => {
        setName(e.target.value);
        console.log(e.target.value);
    };
    

    return (
        <section className="home-section">
        {/* container principal com blur quando modal estiver ativo */}
        <div className={`home-container ${isModalOpen ? "blur" : ""}`}>
            <img
            src="/background forest.svg"
            alt="plano-de-fundo-floresta-infantil"
            className="home-bg"
            />
            <img src="/logo.svg" alt="logo-letrola" className="logo" />
            <img
            src="./monkey.svg"
            alt="imagem-de-macaco-infantil"
            className="monkey"
            />
            <img src="./light.svg" alt="" className="light" />

            <div className="cube-container">
            <img src="/pink cube.svg" alt="" className="pink" />
            <img src="/green cube.svg" alt="" className="green" />
            <img src="/blue cube.svg" alt="" className="blue" />
            <img src="/yellow cube.svg" alt="" className="yellow" />
            <img src="/red cube.svg" alt="" className="red" />
            </div>

            <button className="settings-btn">
            <div></div>
            <img src="/Settings.svg" alt="Configurações" />
            </button>

            <button className="start-btn" onClick={handleStart}>
            <div></div>
            Começar
            </button>
        </div>

        {isModalOpen && (
            <div className="modal-overlay" onClick={handleClose}>
            <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()} 
            >
                <div className="ribbon">
                    <img src="/ribbon-banner-red.svg" alt="imagem-de-faixa-vermelha"/>
                    <h2>Quem é você?</h2>
                </div>

                <p>Digite seu nome</p>

                <input type="text" placeholder="Ex: Matheus" className="input-name" onChange={handleInputChange}/>

                <button onClick={handleContinue} className="next-btn">
                    <div></div>
                    <p>Continuar</p>
                </button>

            </div>
            </div>
        )}
        </section>
    );
}

export default Home;
