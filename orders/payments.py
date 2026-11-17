import uuid
from dataclasses import dataclass

SUCCESS_CARD = "4242424242424242"
DECLINE_CARD = "4000000000000002"


@dataclass
class ChargeResult:
    success: bool
    reference: str
    message: str


def charge(card_number, amount):
    """Fake payment gateway. Later, swap the body of this function for a
    real Paystack or Stripe call and nothing else needs to change."""
    reference = f"SIM-{uuid.uuid4().hex[:12].upper()}"
    if card_number == SUCCESS_CARD:
        return ChargeResult(True, reference, "Payment successful.")
    if card_number == DECLINE_CARD:
        return ChargeResult(False, reference, "Your card was declined.")
    return ChargeResult(
        False, reference, "Unknown test card. Use 4242 4242 4242 4242."
    )
