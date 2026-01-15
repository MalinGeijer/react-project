
# 3. Application
#
# Skapa en applikation som använder den tränade modellen för att göra prediktioner.
# Applikationen får vara:
# – Terminalbaserad (exempelvis via meny och inmatning),
# – Byggd i Tkinter, eller
# – Byggd i Streamlit.
# Applikationen ska tydligt visa modellens resultat och prediktioner.

# VG
# Applikationen visar på kreativitet och fördjupad förståelse
# (t.ex. mer avancerad visualisering, hyperparameter-tuning, feature engineering,
# eller ett mer interaktivt gränssnitt).

# Tkinter är Pythons inbyggda bibliotek för att skapa grafiska fönsterprogram (GUI).
# Det låter dig bygga saker som:

# knappar
# textfält
# labels
# menyer
# dialogrutor

# …och paketet följer med Python, så du behöver oftast inte installera något extra.

# Det är liksom “standardverktyget” om du vill göra ett litet desktop-program i
# Python utan att dra in stora ramverk.

# exemple

import tkinter as tk

root = tk.Tk()
root.title("Min app")

label = tk.Label(root, text="Hello from Tkinter!")
label.pack()

root.mainloop()

# Streamlit är ett Python-ramverk för att bygga moderna webbappar – utan att behöva
# skriva HTML, CSS eller JavaScript.
# Du skriver bara vanlig Python, kör streamlit run app.py, och poff så har du en
# interaktiv webbsida.

# Perfekt för:

# dashboards
# datavisualisering
# AI-demoappar
# ML-modeller du vill visa upp
# snabba prototyper (extremt snabba)

# Och du får:
# en textinput
# en dynamisk sida som uppdateras direkt
# ingen frontend-kod alls
# superenkelt att bygga UI-komponenter
# snyggt som standard
# perfekt för ML eftersom du bara matar in diagram och predictions
# allt körs i webbläsaren

# exempel
import streamlit as st

st.title("Hello Streamlit")
name = st.text_input("What is your name?")
st.write("You wrote:", name)

# to run streamlit run app.py
