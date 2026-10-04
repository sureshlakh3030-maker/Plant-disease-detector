"""
Fine-tune EfficientNet-B3 on the "New Plant Diseases Dataset (Augmented)".

Two-phase transfer learning:
  Phase 1: freeze the backbone, train only the new classifier head
  Phase 2: unfreeze everything, fine-tune at a lower learning rate

Usage:
    python train_efficientnet_plant_disease.py

Before running, edit the DATA_DIR path below to point at your dataset folder.
Expected folder layout (this is what the dataset ships with):

    New Plant Diseases Dataset(Augmented)/
        train/
            Apple___Apple_scab/
                img1.jpg ...
            Apple___Black_rot/
            ...
        valid/
            Apple___Apple_scab/
            ...
"""

import os
import numpy as np
import torch
from datasets import load_dataset
from transformers import (
    EfficientNetImageProcessor,
    EfficientNetForImageClassification,
    TrainingArguments,
    Trainer,
)
import evaluate

# ---------------------------------------------------------------------------
# 1. Config — EDIT THESE PATHS
# ---------------------------------------------------------------------------

# Root folder that contains train/ and valid/ subfolders
DATA_DIR = r"D:\New Plant Diseases Dataset(Augmented)\New Plant Diseases Dataset(Augmented)"

MODEL_CHECKPOINT = "google/efficientnet-b3"
OUTPUT_DIR = "./efficientnet-b3-plant-disease"

# ---------------------------------------------------------------------------
# 2. Load dataset (imagefolder auto-detects train/ and valid/ as splits)
# ---------------------------------------------------------------------------

dataset = load_dataset("imagefolder", data_dir=DATA_DIR)
print(dataset)

# If there's no "valid" split, carve one out of train (90/10 split)
if "valid" not in dataset and "validation" not in dataset:
    split = dataset["train"].train_test_split(test_size=0.1, seed=42)
    dataset["train"] = split["train"]
    dataset["valid"] = split["test"]
elif "validation" in dataset:
    dataset["valid"] = dataset["validation"]

label_names = dataset["train"].features["label"].names
num_labels = len(label_names)
id2label = {i: name for i, name in enumerate(label_names)}
label2id = {name: i for i, name in enumerate(label_names)}
print(f"Found {num_labels} classes")

# ---------------------------------------------------------------------------
# 3. Preprocessing
# ---------------------------------------------------------------------------

processor = EfficientNetImageProcessor.from_pretrained(MODEL_CHECKPOINT)


def transform(batch):
    images = [img.convert("RGB") for img in batch["image"]]
    inputs = processor(images, return_tensors="pt")
    inputs["labels"] = batch["label"]
    return inputs


dataset = dataset.with_transform(transform)

# ---------------------------------------------------------------------------
# 4. Load pretrained model, replace classifier head for our classes
# ---------------------------------------------------------------------------

model = EfficientNetForImageClassification.from_pretrained(
    MODEL_CHECKPOINT,
    num_labels=num_labels,
    id2label=id2label,
    label2id=label2id,
    ignore_mismatched_sizes=True,  # replaces the 1000-class ImageNet head
)

# ---------------------------------------------------------------------------
# 5. Metric
# ---------------------------------------------------------------------------

accuracy = evaluate.load("accuracy")


def compute_metrics(eval_pred):
    logits, labels = eval_pred
    predictions = np.argmax(logits, axis=-1)
    return accuracy.compute(predictions=predictions, references=labels)


def collate_fn(batch):
    pixel_values = torch.stack([item["pixel_values"] for item in batch])
    labels = torch.tensor([item["labels"] for item in batch])
    return {"pixel_values": pixel_values, "labels": labels}


# ---------------------------------------------------------------------------
# 6. Phase 1 — freeze backbone, train classifier head only
# ---------------------------------------------------------------------------

for name, param in model.named_parameters():
    if "classifier" not in name:
        param.requires_grad = False

phase1_args = TrainingArguments(
    output_dir=OUTPUT_DIR + "/phase1",
    per_device_train_batch_size=16,
    per_device_eval_batch_size=16,
    num_train_epochs=4,
    learning_rate=1e-3,
    lr_scheduler_type="cosine",
    warmup_ratio=0.1,
    eval_strategy="epoch",
    save_strategy="epoch",
    load_best_model_at_end=True,
    metric_for_best_model="accuracy",
    logging_steps=50,
    fp16=torch.cuda.is_available(),
    remove_unused_columns=False,
    report_to="none",
)

trainer = Trainer(
    model=model,
    args=phase1_args,
    train_dataset=dataset["train"],
    eval_dataset=dataset["valid"],
    data_collator=collate_fn,
    compute_metrics=compute_metrics,
)

print("\n=== Phase 1: training classifier head only ===")
trainer.train()

# ---------------------------------------------------------------------------
# 7. Phase 2 — unfreeze everything, fine-tune at a lower LR
# ---------------------------------------------------------------------------

for param in model.parameters():
    param.requires_grad = True

phase2_args = TrainingArguments(
    output_dir=OUTPUT_DIR + "/phase2",
    per_device_train_batch_size=16,
    per_device_eval_batch_size=16,
    num_train_epochs=12,
    learning_rate=1e-4,
    lr_scheduler_type="cosine",
    warmup_ratio=0.05,
    eval_strategy="epoch",
    save_strategy="epoch",
    load_best_model_at_end=True,
    metric_for_best_model="accuracy",
    logging_steps=50,
    fp16=torch.cuda.is_available(),
    remove_unused_columns=False,
    report_to="none",
    save_total_limit=2,
)

trainer = Trainer(
    model=model,
    args=phase2_args,
    train_dataset=dataset["train"],
    eval_dataset=dataset["valid"],
    data_collator=collate_fn,
    compute_metrics=compute_metrics,
)

print("\n=== Phase 2: fine-tuning full model ===")
trainer.train()

# ---------------------------------------------------------------------------
# 8. Final evaluation + save
# ---------------------------------------------------------------------------

metrics = trainer.evaluate()
print("\nFinal validation metrics:", metrics)

final_dir = OUTPUT_DIR + "/final"
trainer.save_model(final_dir)
processor.save_pretrained(final_dir)
print(f"\nModel + processor saved to: {final_dir}")