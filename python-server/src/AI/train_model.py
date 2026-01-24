import argparse
from pathlib import Path
import sys
import logging

# adjust import path if you place this at repo root
sys.path.insert(0, str(Path(__file__).resolve().parent / "src"))

from model_trainer import ModelTrainer

# --- Setup logging ---
logs_dir = Path("logs")
logs_dir.mkdir(exist_ok=True)
log_file = logs_dir / "training.log"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(log_file),
        logging.StreamHandler(sys.stdout)
    ]
)

def main():
    p = argparse.ArgumentParser(
        description="Train ML model (LR, RF, MLP) on MNIST")
    p.add_argument(
        "-m",
        choices=["LR", "RF", "MLP"],
        default="LR",
        help="Model to train: LR (LogisticRegression), RF (RandomForest), MLP (Neural Net)")
    p.add_argument(
        "-n",
        type=int,
        default=60000,
        help="Number of training samples")
    p.add_argument(
        "-i",
        type=int,
        default=500,
        help="Iterations (LR)")
    p.add_argument(
        "-t",
        type=int,
        default=300,
        help="Number of trees (RF)")
    p.add_argument(
        "-e",
        type=int,
        default=20,
        help="Number of epochs (MLP)")
    args = p.parse_args()

    logging.info(f"Starting training: model={args.m}, samples={args.n}, iterations={args.i}, trees={args.t}, epochs={args.e}")

    trainer = ModelTrainer(
        model_name=args.m,
        train_size=args.n,
        iterations=args.i,
        trees=args.t,
        epochs=args.e,
        random_state=42
    )

    model_path = trainer.train_on_mnist()
    logging.info(f"Saved model: {model_path}")

if __name__ == "__main__":
    main()
