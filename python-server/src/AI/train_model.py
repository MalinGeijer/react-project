import argparse
from pathlib import Path
import sys

from model_trainer import ModelTrainer

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
        default=300,
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

    mt = ModelTrainer(
        model_name=args.m,
        train_size=args.n,
        iterations=args.i,
        trees=args.t,
        epochs=args.e,
        random_state=42
    )

    mt.train_on_mnist()

if __name__ == "__main__":
    main()
