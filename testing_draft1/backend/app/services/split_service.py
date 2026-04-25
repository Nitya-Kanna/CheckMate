"""
Split Service — NLP (Bedrock LLM) + Manual calculation

For hackathon MVP: NLP uses mock response; manual split is fully functional.
Production: integrate Amazon Bedrock (Claude/Llama) for NLP parsing.
"""

from app.models.schemas import (
    ReceiptItemResponse,
    ContactInfo,
    NlpSplitResponse,
    DiscoveredPerson,
    PersonAssignment,
    ItemAssignment,
    ManualAssignment,
    ManualSplitResponse,
    PersonTotal,
)


async def nlp_split(
    items: list[ReceiptItemResponse],
    contacts: list[ContactInfo],
    prompt: str,
) -> NlpSplitResponse:
    """
    Parse natural language prompt to assign receipt items to people.
    
    TODO: Integrate Amazon Bedrock (Claude/Llama) with the agentic split prompt.
    TODO: Implement fuzzy contact matching for name disambiguation.
    """
    # ── MOCK RESPONSE for development ──
    return NlpSplitResponse(
        discovered_people=[
            DiscoveredPerson(
                name="Calvin",
                match_status="found",
                matched_contact_id=contacts[0].id if contacts else None,
                suggested_phone=contacts[0].phone if contacts else None,
            ),
            DiscoveredPerson(
                name="Jet",
                match_status="new",
                matched_contact_id=None,
                suggested_phone=None,
            ),
        ],
        assignments=[
            PersonAssignment(
                person="Calvin",
                items=[
                    ItemAssignment(item_index=0, share_ratio=1.0),
                    ItemAssignment(item_index=1, share_ratio=1.0),
                    ItemAssignment(item_index=3, share_ratio=0.5),
                ],
                amount=14.83,
            ),
            PersonAssignment(
                person="Jet",
                items=[
                    ItemAssignment(item_index=2, share_ratio=1.0),
                    ItemAssignment(item_index=3, share_ratio=0.5),
                ],
                amount=14.32,
            ),
        ],
    )


def manual_split(
    items: list[ReceiptItemResponse],
    assignments: list[ManualAssignment],
) -> ManualSplitResponse:
    """
    Calculate per-person totals from manual item assignments.
    Tax is pro-rated based on each person's share of the subtotal.
    """
    subtotal = sum(item.total_price for item in items)
    tax = sum(item.total_price for item in items)  # will be replaced
    # Recalculate: get tax from total context (not available here, use items sum approach)
    
    person_subtotals: dict[str, float] = {}
    
    for assignment in assignments:
        person = assignment.person
        person_total = 0.0
        for idx in assignment.item_indices:
            if 0 <= idx < len(items):
                person_total += items[idx].total_price
        person_subtotals[person] = person_total
    
    # Pro-rate tax
    total_assigned = sum(person_subtotals.values())
    person_totals = []
    for person, amount in person_subtotals.items():
        tax_share = 0.0
        if total_assigned > 0:
            tax_share = (amount / total_assigned) * (subtotal * 0.06)  # 6% SST
        person_totals.append(PersonTotal(
            person=person,
            amount=round(amount + tax_share, 2),
        ))
    
    return ManualSplitResponse(person_totals=person_totals)
