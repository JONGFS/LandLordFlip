from crewai import Agent, LLM


def build(llm: LLM) -> Agent:
    return Agent(
        role="Creative Director & Critic",
        goal=(
            "Score the selected rental promo script and storyboard on marketing quality. "
            "Return a confidence score from 0-100, a list of strengths, a list of weaknesses, "
            "and at least one concrete improvement note."
        ),
        backstory=(
            "You are a creative director who has reviewed thousands of rental video ads. "
            "You evaluate ads on hook strength, factual accuracy, audience fit, CTA clarity, "
            "and scene pacing. You give honest, specific feedback — not vague platitudes. "
            "A score above 80 means the ad is ready to publish. Below 60 means significant "
            "rework is needed."
        ),
        llm=llm,
        verbose=True,
        allow_delegation=False,
    )
