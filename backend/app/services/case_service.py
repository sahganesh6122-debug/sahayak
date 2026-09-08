from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.clinical_case import ClinicalCase
from app.models.patient import Patient
from app.models.history_answer import HistoryAnswer
from app.models.ai_summary import AISummary
from app.models.red_flag import RedFlag
from app.ai.provider import get_ai_service

async def generate_summary_for_case(case_id: str, db: AsyncSession):
    result = await db.execute(
        select(ClinicalCase).where(ClinicalCase.id == case_id)
    )
    case = result.scalar_one_or_none()
    if not case:
        return None

    patient = await db.get(Patient, case.patient_id)

    history_result = await db.execute(
        select(HistoryAnswer).where(HistoryAnswer.case_id == case_id)
    )
    history = [
        {
            "question_key": answer.question_key,
            "question": answer.question_text,
            "answer": answer.answer_text,
            "answer_type": answer.answer_type,
        }
        for answer in history_result.scalars().all()
    ]
    ai_service = get_ai_service()
    summary_data = ai_service.generate_summary({
        "patient": {
            "id": patient.id if patient else None,
            "full_name": patient.full_name if patient else None,
            "age": patient.age if patient else None,
            "gender": patient.gender if patient else None,
            "language_preference": patient.language_preference if patient else None,
        },
        "chief_complaint": case.chief_complaint,
        "history": history,
    })

    result = await db.execute(select(AISummary).where(AISummary.case_id == case_id))
    summary = result.scalar_one_or_none()
    if not summary:
        summary = AISummary(case_id=case_id)
        db.add(summary)

    summary.patient_overview = summary_data.get("patient_overview")
    summary.chief_complaint_summary = summary_data["chief_complaint_summary"]
    summary.history_summary = summary_data.get("history_summary")
    summary.associated_symptoms = summary_data.get("associated_symptoms")
    summary.past_history_summary = summary_data.get("past_history_summary")
    summary.medication_summary = summary_data.get("medication_summary")
    summary.allergies_summary = summary_data.get("allergies_summary")
    summary.investigations_summary = summary_data.get("investigations_summary")
    summary.red_flag_summary = summary_data.get("red_flag_summary")
    summary.ai_narrative = (
        "AI-Generated — Requires Doctor Review\n\n"
        f"{summary_data['ai_narrative']}"
    )
    summary.is_mock = summary_data["is_mock"]
    await db.commit()
    await db.refresh(summary)
    return summary

async def generate_red_flags_for_case(case_id: str, db: AsyncSession):
    case = await db.get(ClinicalCase, case_id)
    if not case:
        return []
    ai_service = get_ai_service()
    flags = ai_service.detect_red_flags(case.chief_complaint, {})

    created_flags = []
    for f in flags:
        existing = await db.execute(
            select(RedFlag).where(
                RedFlag.case_id == case_id,
                RedFlag.flag_type == f["flag_type"],
                RedFlag.description == f["description"],
            )
        )
        if existing.scalar_one_or_none():
            continue
        rf = RedFlag(
            case_id=case_id,
            flag_type=f["flag_type"],
            description=f["description"],
            severity=f["severity"],
            reason=f["reason"]
        )
        db.add(rf)
        created_flags.append(rf)
    await db.commit()
    return created_flags

def generate_adaptive_questions(chief_complaint: str):
    ai_service = get_ai_service()
    return ai_service.generate_followup_questions(chief_complaint, {})

async def generate_timeline_for_case(case_id: str, db: AsyncSession):
    pass # Timeline compilation logic can go here
