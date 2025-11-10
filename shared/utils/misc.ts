export function checkPasswordStrength(str: string) {
  const requirements = [
    { regex: /.{8,}/, text: 'At least 8 characters', score: 60 },
    { regex: /\d/, text: 'At least 1 number', score: 10 },
    { regex: /[a-z]/, text: 'At least 1 lowercase letter', score: 10 },
    { regex: /[A-Z]/, text: 'At least 1 uppercase letter', score: 10 },
    {
      regex: /(?=.*[@#$%^&*_])/,
      text: 'At least one special character - @#$%^&*_',
      score: 10,
    },
  ];

  const strength = requirements.map(req => ({
    met: req.regex.test(str),
    text: req.text,
    score: req.score,
  }));

  const score = strength
    .filter(req => req.met)
    .map(x => x.score)
    .reduce((prev, curr) => prev + curr, 0);

  return { strength, score };
}
