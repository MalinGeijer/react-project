# 2. Modellering
#
# Dela upp datasetet i tränings- och testdata.
# Träna en maskininlärningsmodell (Logistic Regression, RandomForest eller XGBoost).
# Utvärdera modellen (accuracy, confusion matrix, eller classification report).
# Inkludera minst en ytterligare utvärderingsmetod (ROC/AUC, F1-score, precision/recall, eller feature importance).
#
# Jämförelse mellan minst två modeller. Motivera!
#
# Rapporten innehåller motivering till modellval, och en tydlig diskussion om resultat.

import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import joblib
import os
from pathlib import Path
import logging
from datetime import datetime

def setup_logging():
    """Konfigurera logging till fil"""
    # Skapa logs katalog
    logs_dir = Path("logs")
    logs_dir.mkdir(exist_ok=True)

    # Skapa loggfil med timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    log_file = logs_dir / f"training_{timestamp}.log"

    # Konfigurera logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(log_file),
            logging.StreamHandler()  # Fortfarande visa i terminal
        ]
    )

    return log_file

def train_logistic_regression(X_train, y_train, X_test, y_test):
    """Träna och spara Logistic Regression modell"""
    logging.info("Tränar Logistic Regression...")
    model = LogisticRegression(max_iter=1000, random_state=42)
    model.fit(X_train, y_train)

    # Utvärdera
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    logging.info(f"Logistic Regression Accuracy: {accuracy:.4f}")

    # Ytterligare utvärdering
    logging.info("\nClassification Report:")
    report = classification_report(y_test, y_pred)
    logging.info(f"\n{report}")

    # Spara modell
    models_dir = Path("models")
    models_dir.mkdir(exist_ok=True)
    model_path = models_dir / "logistic_regression.pkl"
    joblib.dump(model, model_path)
    logging.info(f"✓ Sparade modell: {model_path}")

    return model

def train_random_forest(X_train, y_train, X_test, y_test):
    """Träna och spara Random Forest modell"""
    logging.info("Tränar Random Forest...")
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    # Utvärdera
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    logging.info(f"Random Forest Accuracy: {accuracy:.4f}")

    # Ytterligare utvärdering - Confusion Matrix
    cm = confusion_matrix(y_test, y_pred)
    logging.info(f"\nConfusion Matrix:\n{cm}")

    # Feature importance (första 10 features)
    feature_importance = model.feature_importances_[:10]
    logging.info(f"\nTop 10 Feature Importances: {feature_importance}")

    # Spara modell
    models_dir = Path("models")
    models_dir.mkdir(exist_ok=True)
    model_path = models_dir / "random_forest.pkl"
    joblib.dump(model, model_path)
    logging.info(f"✓ Sparade modell: {model_path}")

    return model

def train_neural_network(X_train, y_train, X_test, y_test):
    """Träna och spara Neural Network (kräver TensorFlow/Keras)"""
    logging.info("Tränar Neural Network...")
    try:
        from tensorflow import keras
        from tensorflow.keras import layers

        # Bygg modell
        model = keras.Sequential([
            layers.Dense(128, activation='relu', input_shape=(784,)),
            layers.Dropout(0.2),
            layers.Dense(64, activation='relu'),
            layers.Dropout(0.2),
            layers.Dense(10, activation='softmax')
        ])

        model.compile(optimizer='adam',
                     loss='sparse_categorical_crossentropy',
                     metrics=['accuracy'])

        # Träna
        logging.info("Tränar modell (detta kan ta några minuter)...")
        model.fit(X_train, y_train, epochs=5, validation_split=0.1, verbose=1)

        # Utvärdera
        test_loss, test_acc = model.evaluate(X_test, y_test, verbose=0)
        logging.info(f"Neural Network Accuracy: {test_acc:.4f}")

        # Ytterligare utvärdering - predict på några samples
        predictions = model.predict(X_test[:5], verbose=0)
        logging.info(f"\nFörsta 5 predictions (probabilities):\n{predictions}")

        # Spara modell
        models_dir = Path("models")
        models_dir.mkdir(exist_ok=True)
        model_path = models_dir / "neural_network.h5"
        model.save(model_path)
        logging.info(f"✓ Sparade modell: {model_path}")

        return model

    except ImportError:
        logging.error("❌ TensorFlow inte installerat - hoppar över Neural Network")
        logging.error("Installera med: pip install tensorflow")
        return None

def load_mnist_data():
    """Ladda och förbered MNIST data"""
    logging.info("Laddar MNIST data...")
    try:
        from tensorflow.keras.datasets import mnist

        # Ladda data
        (x_train, y_train), (x_test, y_test) = mnist.load_data()

        # Normalisering (0-255 → 0-1)
        x_train = x_train.astype("float32") / 255.0
        x_test = x_test.astype("float32") / 255.0

        # Flatten: 28x28 → 784
        x_train = x_train.reshape(x_train.shape[0], -1)  # (60000, 784)
        x_test = x_test.reshape(x_test.shape[0], -1)    # (10000, 784)

        logging.info(f"Träningsdata: {x_train.shape}, Labels: {y_train.shape}")
        logging.info(f"Testdata: {x_test.shape}, Labels: {y_test.shape}")

        return x_train, y_train, x_test, y_test

    except ImportError:
        logging.error("❌ TensorFlow inte installerat. Installera med: pip install tensorflow")
        return None, None, None, None

def train_all_models():
    """Huvudfunktion - ladda data och träna alla modeller"""
    log_file = setup_logging()

    logging.info("=" * 50)
    logging.info("ML MODELLTRÄNING FÖR SIFFRIGENKÄNNING")
    logging.info("=" * 50)
    logging.info(f"Loggar sparas i: {log_file}")

    # Ladda data
    x_train, y_train, x_test, y_test = load_mnist_data()
    if x_train is None:
        return None

    # Träna modeller
    logging.info("\n" + "=" * 30)
    logging.info("TRÄNAR MODELLER")
    logging.info("=" * 30)

    lr_model = train_logistic_regression(x_train, y_train, x_test, y_test)
    rf_model = train_random_forest(x_train, y_train, x_test, y_test)
    nn_model = train_neural_network(x_train, y_train, x_test, y_test)

    logging.info("\n" + "=" * 30)
    logging.info("TRÄNING KLAR!")
    logging.info("=" * 30)
    logging.info("Modeller sparade i 'models/' katalog")
    logging.info("- logistic_regression.pkl")
    logging.info("- random_forest.pkl")
    logging.info("- neural_network.h5 (om TensorFlow fanns)")

    return {
        'logistic_regression': lr_model,
        'random_forest': rf_model,
        'neural_network': nn_model
    }

# Kör träning om filen körs direkt
if __name__ == "__main__":
    models = train_all_models()
    if models:
        trained_count = len([m for m in models.values() if m is not None])
        logging.info(f"\n✅ Tränade {trained_count} modeller framgångsrikt!")
        print(f"\n✅ Tränade {trained_count} modeller framgångsrikt!")
        print(f"📄 Loggar sparade i logs/training_*.log")
    else:
        logging.error("\n❌ Ingen träning genomförd - kontrollera beroenden")
        print("\n❌ Ingen träning genomförd - kontrollera beroenden")
