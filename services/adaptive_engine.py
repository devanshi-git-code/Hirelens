def decide_next_difficulty(score, current_difficulty):

    # Strong performance
    if score >= 8.5:
        if current_difficulty == "easy":
            return "medium"
        elif current_difficulty == "medium":
            return "hard"
        else:
            return "hard"

    # Average performance
    elif score >= 6:
        return current_difficulty

    # Weak performance
    else:
        if current_difficulty == "hard":
            return "medium"
        elif current_difficulty == "medium":
            return "easy"
        else:
            return "easy"


def get_next_action(score, current_difficulty):

    next_difficulty = decide_next_difficulty(
        score,
        current_difficulty
    )

    return {
        "current_score": score,
        "current_difficulty": current_difficulty,
        "next_difficulty": next_difficulty
    }